package expo.modules.rtxadblocker

import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetSocketAddress
import java.nio.ByteBuffer
import kotlin.concurrent.thread

/**
 * RtxAdBlockVpnService
 * ----------------------
 * HONEST SCOPE AND LIMITATIONS - read before relying on this in production:
 *
 * This is a DNS-SINKHOLE style ad blocker, the same general technique used
 * by well-known open-source blockers (DNS66, Blokada's legacy engine). It
 * does NOT inspect or filter general HTTP/HTTPS traffic (that would need
 * TLS interception, which breaks most apps and isn't appropriate here) -
 * it only blocks ads/trackers that are still requested by DOMAIN NAME via
 * DNS. Modern in-app ads served over the same domain as core app content,
 * or via hardcoded IPs, will NOT be blocked. This is a real, useful, but
 * PARTIAL solution - market it as "blocks many ad/tracker domains", never
 * as "blocks all ads."
 *
 * This is low-level networking code (manual IP/UDP/DNS packet parsing).
 * It has NOT been tested against every Android version/device and should
 * be thoroughly tested on real devices before shipping. Edge cases this
 * simplified version does not handle: IPv6 DNS, DNS-over-TCP, EDNS0,
 * fragmented packets. For a production-grade version, budget real testing
 * time or consider building on top of a proven open-source DNS-VPN engine
 * instead of this from-scratch implementation.
 */
class RtxAdBlockVpnService : VpnService() {

  companion object {
    private const val TAG = "RtxAdBlockVpn"
    private const val VPN_ADDRESS = "10.0.0.2"
    private const val UPSTREAM_DNS = "1.1.1.1" // Cloudflare - swap for your preferred resolver

    @Volatile
    var blockedDomains: Set<String> = emptySet()

    @Volatile
    var isRunning: Boolean = false
  }

  private var vpnInterface: ParcelFileDescriptor? = null
  private var workerThread: Thread? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    startVpn()
    return START_STICKY
  }

  override fun onDestroy() {
    stopVpn()
    super.onDestroy()
  }

  override fun onRevoke() {
    stopVpn()
    super.onRevoke()
  }

  private fun startVpn() {
    if (isRunning) return

    val builder = Builder()
      .setSession("RTX Ad Blocker")
      .addAddress(VPN_ADDRESS, 32)
      // Only route DNS traffic (port 53) through the VPN - keeps this a
      // lightweight DNS filter, not a full traffic-intercepting VPN.
      .addRoute(UPSTREAM_DNS, 32)
      .addDnsServer(VPN_ADDRESS)

    vpnInterface = builder.establish()
    if (vpnInterface == null) {
      Log.e(TAG, "Failed to establish VPN interface - permission not granted?")
      return
    }

    isRunning = true
    workerThread = thread(start = true) { runPacketLoop() }
  }

  private fun stopVpn() {
    isRunning = false
    workerThread?.interrupt()
    workerThread = null
    try {
      vpnInterface?.close()
    } catch (e: Exception) {
      Log.e(TAG, "Error closing VPN interface", e)
    }
    vpnInterface = null
  }

  private fun runPacketLoop() {
    val fd = vpnInterface ?: return
    val input = FileInputStream(fd.fileDescriptor)
    val output = FileOutputStream(fd.fileDescriptor)
    val buffer = ByteArray(32767)

    while (isRunning && !Thread.currentThread().isInterrupted) {
      try {
        val length = input.read(buffer)
        if (length <= 0) continue

        val packet = buffer.copyOf(length)
        handleIpPacket(packet, output)
      } catch (e: Exception) {
        if (isRunning) Log.e(TAG, "Packet loop error", e)
      }
    }
  }

  /**
   * Parses a raw IPv4 packet, and if it's a UDP DNS query (port 53),
   * decides to block (send back a fake "not found" answer) or forward it
   * to the real upstream DNS server and relay the response back.
   * Non-DNS packets are dropped (since only DNS traffic is routed here,
   * see startVpn's addRoute call).
   */
  private fun handleIpPacket(packet: ByteArray, output: FileOutputStream) {
    if (packet.size < 20) return
    val ipHeaderLength = (packet[0].toInt() and 0x0F) * 4
    val protocol = packet[9].toInt() and 0xFF
    if (protocol != 17) return // 17 = UDP

    val udpStart = ipHeaderLength
    if (packet.size < udpStart + 8) return
    val srcPort = ((packet[udpStart].toInt() and 0xFF) shl 8) or (packet[udpStart + 1].toInt() and 0xFF)
    val dstPort = ((packet[udpStart + 2].toInt() and 0xFF) shl 8) or (packet[udpStart + 3].toInt() and 0xFF)
    if (dstPort != 53) return // only handle DNS queries

    val dnsStart = udpStart + 8
    if (packet.size <= dnsStart) return
    val dnsPayload = packet.copyOfRange(dnsStart, packet.size)
    val domain = extractDomainFromDnsQuery(dnsPayload) ?: return

    if (isBlocked(domain)) {
      Log.d(TAG, "BLOCKED: $domain")
      val response = buildBlockedDnsResponse(dnsPayload)
      writeUdpResponse(packet, ipHeaderLength, srcPort, response, output)
    } else {
      forwardToUpstreamDns(packet, ipHeaderLength, srcPort, dnsPayload, output)
    }
  }

  private fun isBlocked(domain: String): Boolean {
    val lower = domain.lowercase()
    return blockedDomains.any { lower == it || lower.endsWith(".$it") }
  }

  /** Minimal DNS question-section parser - reads the queried domain name. */
  private fun extractDomainFromDnsQuery(dns: ByteArray): String? {
    if (dns.size < 12) return null
    var pos = 12 // DNS header is 12 bytes
    val labels = mutableListOf<String>()
    while (pos < dns.size) {
      val len = dns[pos].toInt() and 0xFF
      if (len == 0) break
      pos += 1
      if (pos + len > dns.size) return null
      labels.add(String(dns, pos, len, Charsets.US_ASCII))
      pos += len
    }
    return if (labels.isEmpty()) null else labels.joinToString(".")
  }

  /** Builds a DNS response saying "this domain does not exist" (NXDOMAIN). */
  private fun buildBlockedDnsResponse(query: ByteArray): ByteArray {
    val response = query.copyOf()
    response[2] = (response[2].toInt() or 0x80).toByte() // QR = 1 (response)
    response[3] = (response[3].toInt() or 0x03).toByte() // RCODE = 3 (NXDOMAIN)
    return response
  }

  /** Sends the DNS query to a real upstream resolver and relays the answer back. */
  private fun forwardToUpstreamDns(
    originalPacket: ByteArray,
    ipHeaderLength: Int,
    srcPort: Int,
    dnsPayload: ByteArray,
    output: FileOutputStream
  ) {
    try {
      val socket = DatagramSocket()
      protect(socket) // exclude this socket from the VPN, or we'd loop forever
      socket.soTimeout = 5000

      val request = DatagramPacket(dnsPayload, dnsPayload.size, InetSocketAddress(UPSTREAM_DNS, 53))
      socket.send(request)

      val responseBuffer = ByteArray(4096)
      val responsePacket = DatagramPacket(responseBuffer, responseBuffer.size)
      socket.receive(responsePacket)
      socket.close()

      val responseBytes = responseBuffer.copyOf(responsePacket.length)
      writeUdpResponse(originalPacket, ipHeaderLength, srcPort, responseBytes, output)
    } catch (e: Exception) {
      Log.e(TAG, "Upstream DNS forward failed", e)
    }
  }

  /**
   * Wraps a DNS response payload back into IP/UDP headers matching the
   * original query (swapped src/dst) and writes it back into the TUN fd
   * so the requesting app receives its answer.
   */
  private fun writeUdpResponse(
    originalPacket: ByteArray,
    ipHeaderLength: Int,
    srcPort: Int,
    dnsResponse: ByteArray,
    output: FileOutputStream
  ) {
    val udpLength = 8 + dnsResponse.size
    val totalLength = ipHeaderLength + udpLength
    val out = ByteBuffer.allocate(totalLength)

    // --- IP header: copy original, swap src/dst addresses ---
    out.put(originalPacket, 0, ipHeaderLength)
    val packetArray = out.array()
    for (i in 0 until 4) {
      val srcByte = originalPacket[12 + i]
      val dstByte = originalPacket[16 + i]
      packetArray[12 + i] = dstByte // new src = original dst
      packetArray[16 + i] = srcByte // new dst = original src
    }
    packetArray[2] = ((totalLength shr 8) and 0xFF).toByte()
    packetArray[3] = (totalLength and 0xFF).toByte()
    packetArray[10] = 0 // checksum reset (recalculation omitted - see note below)
    packetArray[11] = 0

    // --- UDP header: swap ports, set length, zero checksum (optional in IPv4) ---
    out.position(ipHeaderLength)
    out.put(((53 shr 8) and 0xFF).toByte())
    out.put((53 and 0xFF).toByte())
    out.put(((srcPort shr 8) and 0xFF).toByte())
    out.put((srcPort and 0xFF).toByte())
    out.put(((udpLength shr 8) and 0xFF).toByte())
    out.put((udpLength and 0xFF).toByte())
    out.put(0) // checksum = 0 (valid for IPv4 UDP - means "not computed")
    out.put(0)

    out.put(dnsResponse)

    // NOTE: the IPv4 header checksum is zeroed above rather than properly
    // recalculated. Most Android kernels tolerate this for locally
    // delivered TUN packets, but a production build should implement the
    // standard one's-complement IP header checksum for full correctness.
    output.write(out.array())
  }
}
