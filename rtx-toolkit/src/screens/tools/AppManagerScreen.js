import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import { getInstalledApps, openAppInfo } from '../../../modules/rtx-app-manager';

/**
 * AppManagerScreen
 * ------------------
 * Requires the native module (see modules/rtx-app-manager) - only works
 * after `expo prebuild` + a dev-client build (see docs/BARE_WORKFLOW_SETUP.md),
 * NOT in plain Expo Go.
 *
 * Tapping an app opens Android's own "App Info" page (uninstall/force-stop
 * from there) - no app can silently uninstall or force-stop another app,
 * Android blocks that by design for everyone's security.
 */
export default function AppManagerScreen() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [query, setQuery] = useState('');
  const [showSystem, setShowSystem] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getInstalledApps()
      .then((list) => {
        setApps(list.sort((a, b) => a.appName.localeCompare(b.appName)));
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('Native module পাওয়া যায়নি - dev client build এ রান করুন (Expo Go তে কাজ করবে না)।');
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      if (!showSystem && app.isSystemApp) return false;
      if (query && !app.appName.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [apps, query, showSystem]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Ionicons name="warning" size={40} color={COLORS.warning} />
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="অ্যাপ সার্চ করুন..."
        placeholderTextColor={COLORS.textMuted}
        value={query}
        onChangeText={setQuery}
      />

      <TouchableOpacity style={styles.toggleRow} onPress={() => setShowSystem((v) => !v)}>
        <Ionicons name={showSystem ? 'checkbox' : 'square-outline'} size={18} color={COLORS.secondary} />
        <Text style={styles.toggleLabel}>System apps দেখান</Text>
      </TouchableOpacity>

      <Text style={styles.count}>{filtered.length}টি অ্যাপ</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.packageName}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.appRow} onPress={() => openAppInfo(item.packageName)}>
            <Ionicons name="apps" size={20} color={COLORS.primary} />
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{item.appName}</Text>
              <Text style={styles.appMeta}>
                {item.packageName} {item.versionName ? `· v${item.versionName}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  search: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontFamily: FONTS.mono,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  toggleLabel: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginLeft: SPACING.xs },
  count: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.sm },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  appInfo: { flex: 1, marginLeft: SPACING.sm },
  appName: { fontFamily: FONTS.monoBold, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary },
  appMeta: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
});
