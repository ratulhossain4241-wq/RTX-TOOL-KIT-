import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { discoverTvDevices, pairWithDevice } from '../../../modules/rtx-tv-remote';

/**
 * TvRemoteScreen
 * ----------------
 * HONEST UI STATE: device discovery (finding TVs on the WiFi network)
 * really works. Pairing/control does not exist yet (see
 * RtxTvRemoteModule.kt for exactly why) - tapping a found device shows a
 * clear "coming soon" message instead of pretending to connect. This is
 * intentional: showing a fake-working remote would be more confusing
 * than an honest "not ready yet" state.
 */
export default function TvRemoteScreen() {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setScanning(true);
    setError('');
    try {
      const found = await discoverTvDevices(5000);
      setDevices(found);
    } catch (err) {
      setError('Native module পাওয়া যায়নি - dev client build এ রান করুন।');
    } finally {
      setScanning(false);
    }
  };

  const handleSelectDevice = async (device) => {
    try {
      await pairWithDevice(device.host, device.port);
    } catch (err) {
      Alert.alert(
        'শীঘ্রই আসছে',
        'TV Remote control এখনো তৈরি হয়নি (pairing protocol বাকি) - ডিভাইস খুঁজে পাওয়া কাজ করে, কিন্তু বাটন কন্ট্রোল এখনো implement করা হয়নি।'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TV REMOTE</Text>
      <Text style={styles.subtitle}>&gt; same WiFi network এ থাকা Google TV/Android TV খুঁজুন_</Text>

      <AppButton
        label={scanning ? 'খোঁজা হচ্ছে...' : 'TV খুঁজুন'}
        variant="primary"
        icon="search"
        onPress={handleScan}
        loading={scanning}
      />

      {!!error && <Text style={styles.error}>⚠ {error}</Text>}

      {scanning && <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.lg }} />}

      {devices && !scanning && (
        <FlatList
          data={devices}
          keyExtractor={(item, idx) => `${item.host}-${idx}`}
          contentContainerStyle={{ marginTop: SPACING.lg }}
          ListEmptyComponent={<Text style={styles.empty}>কোনো TV পাওয়া যায়নি - একই WiFi তে আছে কিনা নিশ্চিত করুন।</Text>}
          renderItem={({ item }) => (
            <View style={styles.deviceRow}>
              <Ionicons name="tv" size={22} color={COLORS.secondary} />
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceMeta}>
                  {item.host}:{item.port}
                </Text>
              </View>
              <AppButton label="কানেক্ট" variant="secondary" fullWidth={false} onPress={() => handleSelectDevice(item)} />
            </View>
          )}
        />
      )}

      <View style={styles.noteBox}>
        <Ionicons name="information-circle" size={16} color={COLORS.textMuted} />
        <Text style={styles.note}>
          এই মুহূর্তে শুধু TV খুঁজে বের করা কাজ করে। বাটন দিয়ে কন্ট্রোল করার অংশ (pairing protocol)
          এখনো ডেভেলপমেন্টে আছে।
        </Text>
      </View>
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
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  error: {
    color: COLORS.danger,
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  empty: {
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  deviceInfo: { flex: 1, marginLeft: SPACING.sm },
  deviceName: { fontFamily: FONTS.monoBold, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary },
  deviceMeta: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  noteBox: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
  },
  note: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
});
