import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, PermissionsAndroid, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { scanWifiNetworks } from '../../../modules/rtx-wifi-scanner';

/**
 * WifiScannerScreen
 * -------------------
 * Requires the native module (see modules/rtx-wifi-scanner) - needs a
 * dev-client build, does not work in plain Expo Go.
 *
 * Android REQUIRES location permission before showing WiFi scan results
 * to any app (an OS-level privacy rule, not something this app chooses).
 * We use React Native's built-in PermissionsAndroid - no extra package
 * needed for this.
 */
function signalLabel(rssi) {
  if (rssi >= -50) return { label: 'চমৎকার', color: COLORS.primary };
  if (rssi >= -60) return { label: 'ভালো', color: COLORS.secondary };
  if (rssi >= -70) return { label: 'মোটামুটি', color: COLORS.warning };
  return { label: 'দুর্বল', color: COLORS.danger };
}

export default function WifiScannerScreen() {
  const [networks, setNetworks] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setError('');
    setScanning(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'আশেপাশের WiFi নেটওয়ার্ক দেখতে Android এর নিয়ম অনুযায়ী Location পারমিশন লাগে।',
            buttonPositive: 'ঠিক আছে',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError('Location পারমিশন ছাড়া WiFi স্ক্যান করা যায় না (Android এর নিয়ম)।');
          setScanning(false);
          return;
        }
      }

      const results = await scanWifiNetworks();
      setNetworks(results.sort((a, b) => b.rssi - a.rssi));
    } catch (err) {
      if (err.code === 'WIFI_DISABLED') {
        setError('WiFi বন্ধ আছে - প্রথমে WiFi চালু করুন।');
      } else {
        setError('Native module পাওয়া যায়নি - dev client build এ রান করুন।');
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WIFI SCANNER</Text>

      <AppButton
        label={networks ? 'আবার স্ক্যান করুন' : 'স্ক্যান শুরু করুন'}
        variant="primary"
        icon="wifi"
        onPress={handleScan}
        loading={scanning}
      />

      {!!error && <Text style={styles.error}>⚠ {error}</Text>}

      <Text style={styles.throttleNote}>
        নোট: Android একটানা বারবার স্ক্যান করতে দেয় না (throttling) - কিছুক্ষণ অপেক্ষা করে আবার
        চেষ্টা করুন যদি একই রেজাল্ট দেখায়।
      </Text>

      {networks && (
        <FlatList
          data={networks}
          keyExtractor={(item) => item.bssid}
          contentContainerStyle={{ marginTop: SPACING.md }}
          renderItem={({ item }) => {
            const signal = signalLabel(item.rssi);
            return (
              <View style={styles.networkRow}>
                <Ionicons name="wifi" size={20} color={signal.color} />
                <View style={styles.networkInfo}>
                  <Text style={styles.ssid}>{item.ssid}</Text>
                  <Text style={styles.meta}>
                    {item.frequency} MHz · {item.rssi} dBm
                  </Text>
                </View>
                <Text style={[styles.signalBadge, { color: signal.color }]}>{signal.label}</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  title: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  error: {
    color: COLORS.danger,
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  throttleNote: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  networkInfo: { flex: 1, marginLeft: SPACING.sm },
  ssid: { fontFamily: FONTS.monoBold, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary },
  meta: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  signalBadge: { fontFamily: FONTS.monoBold, fontSize: FONTS.sizes.xs },
});
