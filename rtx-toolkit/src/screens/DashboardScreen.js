import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import PremiumBanner from '../components/PremiumBanner';
import FeatureCard from '../components/FeatureCard';

/**
 * DashboardScreen
 * ---------------
 * Main home screen: grid of every tool. Each entry below maps 1:1 to a
 * featureKey in usePlanLimit.js and a screen name that will be added in a
 * later batch. Adding a new tool later = just add one line to this array,
 * no other file needs to change.
 */
const FEATURES = [
  { key: 'junkCleaner', label: 'Junk Cleaner', icon: 'trash-bin', screen: 'JunkCleaner' },
  { key: 'networkOptimizer', label: 'Network Optimizer', icon: 'speedometer', screen: 'NetworkOptimizer' },
  { key: 'adBlocker', label: 'Ad Blocker', icon: 'shield', screen: 'AdBlocker' },
  { key: 'routerDashboard', label: 'Router Dashboard', icon: 'wifi', screen: 'RouterDashboard' },
  { key: 'batteryOptimizer', label: 'Battery Optimizer', icon: 'battery-charging', screen: 'BatteryOptimizer' },
  { key: 'appManager', label: 'App Manager', icon: 'apps', screen: 'AppManager' },
  { key: 'storageAnalyzer', label: 'Storage Analyzer', icon: 'server', screen: 'StorageAnalyzer' },
  { key: 'systemMonitor', label: 'CPU / RAM Monitor', icon: 'pulse', screen: 'SystemMonitor' },
  { key: 'appLock', label: 'App Lock', icon: 'lock-closed', screen: 'AppLock' },
  { key: 'clipboardCleaner', label: 'Clipboard Cleaner', icon: 'copy', screen: 'ClipboardCleaner' },
  { key: 'duplicateFinder', label: 'Duplicate Finder', icon: 'copy-outline', screen: 'DuplicateFinder' },
  { key: 'speedTest', label: 'Speed Test', icon: 'rocket', screen: 'SpeedTest' },
  { key: 'wifiScanner', label: 'WiFi Scanner', icon: 'wifi-outline', screen: 'WifiScanner' },
  { key: 'qrTool', label: 'QR Tool', icon: 'qr-code', screen: 'QrTool' },
  { key: 'fakeAppDetector', label: 'Fake App Detector', icon: 'warning', screen: 'FakeAppDetector' },
  { key: 'tvRemote', label: 'TV Remote', icon: 'tv', screen: 'TvRemote' },
];

export default function DashboardScreen({ navigation }) {
  const { profile } = useAuth();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>&gt; hello, {profile?.name || 'operator'}_</Text>
          <Text style={styles.appName}>RTX TOOL KIT</Text>
        </View>
        <TouchableOpacity onPress={logoutUser} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <PremiumBanner navigation={navigation} />

      <Text style={styles.sectionTitle}>ALL TOOLS</Text>
      <View style={styles.grid}>
        {FEATURES.map((f) => (
          <FeatureCard
            key={f.key}
            icon={f.icon}
            label={f.label}
            featureKey={f.key}
            navigation={navigation}
            onPress={() => navigation.navigate(f.screen)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
  },
  appName: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    letterSpacing: 1,
    marginTop: 2,
  },
  logoutBtn: {
    padding: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
