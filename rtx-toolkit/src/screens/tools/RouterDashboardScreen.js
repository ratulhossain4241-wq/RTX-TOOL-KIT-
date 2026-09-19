import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import {
  SUPPORTED_BRANDS,
  loginToRouter,
  getRouterDevices,
  toggleDeviceBlock,
} from '../../services/routerService';

/**
 * RouterDashboardScreen
 * ------------------------
 * Premium-only (enforced by FeatureCard before the user even gets here).
 * Flow: pick brand -> enter router IP + the user's OWN admin credentials
 * -> see connected devices -> tap Block/Unblock per device.
 *
 * Only TP-Link is wired up (see routerService.js) - other brands show a
 * clear "not supported yet" message instead of silently failing.
 */
export default function RouterDashboardScreen() {
  const [brand, setBrand] = useState('tplink');
  const [ip, setIp] = useState('192.168.1.1');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyMac, setBusyMac] = useState(null);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const token = await loginToRouter(brand, ip, username, password);
      setSession(token);
      const list = await getRouterDevices(brand, ip, token);
      setDevices(list);
    } catch (err) {
      setError(err.message || 'কানেক্ট করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (device) => {
    setBusyMac(device.mac);
    try {
      await toggleDeviceBlock(brand, ip, session, device.mac, device.blocked);
      setDevices((prev) =>
        prev.map((d) => (d.mac === device.mac ? { ...d, blocked: !d.blocked } : d))
      );
    } catch (err) {
      Alert.alert('সমস্যা', err.message || 'অপারেশন ব্যর্থ হয়েছে।');
    } finally {
      setBusyMac(null);
    }
  };

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ROUTER DASHBOARD</Text>

        <View style={styles.brandRow}>
          {SUPPORTED_BRANDS.map((b) => (
            <TouchableOpacity
              key={b.key}
              style={[styles.brandBtn, brand === b.key && styles.brandBtnActive]}
              onPress={() => setBrand(b.key)}
            >
              <Text style={[styles.brandText, brand === b.key && styles.brandTextActive]}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>ROUTER IP</Text>
          <TextInput style={styles.input} value={ip} onChangeText={setIp} placeholderTextColor={COLORS.textMuted} />

          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={COLORS.textMuted}
          />

          {!!error && <Text style={styles.error}>⚠ {error}</Text>}

          <AppButton label="কানেক্ট করুন" variant="primary" icon="wifi" onPress={handleLogin} loading={loading} />
        </View>

        <Text style={styles.note}>
          আপনার নিজের রাউটারের এডমিন প্যানেলের তথ্য দিন। এই তথ্য শুধু আপনার রাউটারে পাঠানো হয়,
          কোথাও সংরক্ষণ করা হয় না।
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONNECTED DEVICES</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.mac}
        contentContainerStyle={{ paddingBottom: SPACING.lg }}
        ListEmptyComponent={<Text style={styles.empty}>কোনো ডিভাইস পাওয়া যায়নি।</Text>}
        renderItem={({ item }) => (
          <View style={styles.deviceRow}>
            <Ionicons
              name={item.blocked ? 'close-circle' : 'phone-portrait'}
              size={22}
              color={item.blocked ? COLORS.danger : COLORS.primary}
            />
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceMeta}>
                {item.ip} · {item.mac}
              </Text>
            </View>
            <AppButton
              label={item.blocked ? 'Unblock' : 'Block'}
              variant={item.blocked ? 'secondary' : 'danger'}
              fullWidth={false}
              loading={busyMac === item.mac}
              onPress={() => handleToggleBlock(item)}
            />
          </View>
        )}
      />
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
  brandRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  brandBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  brandBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surfaceAlt },
  brandText: { fontFamily: FONTS.mono, color: COLORS.textSecondary },
  brandTextActive: { color: COLORS.primary, fontFamily: FONTS.monoBold },
  form: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.md,
    backgroundColor: COLORS.background,
  },
  error: {
    color: COLORS.danger,
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.md,
  },
  note: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  empty: {
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  deviceInfo: { flex: 1, marginLeft: SPACING.sm },
  deviceName: { fontFamily: FONTS.monoBold, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary },
  deviceMeta: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
});
