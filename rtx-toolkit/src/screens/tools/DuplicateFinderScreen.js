import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import {
  requestMediaPermission,
  findDuplicatePhotos,
  deleteAssets,
} from '../../services/duplicateFinderService';
import { canUseToday, recordUsage } from '../../services/usageService';
import { formatBytes } from '../../services/storageService';

/**
 * DuplicateFinderScreen
 * ------------------------
 * Scans photo library for same-size groups (see duplicateFinderService for
 * the exact honest method), lets the user pick which copies to delete -
 * nothing is ever auto-deleted. Free plan: 1 scan/day.
 */
export default function DuplicateFinderScreen() {
  const navigation = useNavigation();
  const { user, profile, isPremium } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [groups, setGroups] = useState(null);
  const [selected, setSelected] = useState({});

  const { allowed, remaining, limit } = canUseToday(profile, isPremium, 'duplicateFinder');

  const startScan = async () => {
    if (!allowed) {
      navigation.navigate('Premium', { from: 'duplicateFinder' });
      return;
    }
    const granted = await requestMediaPermission();
    if (!granted) {
      Alert.alert('পারমিশন দরকার', 'ফটো স্ক্যান করতে গ্যালারি পারমিশন দিতে হবে।');
      return;
    }
    setScanning(true);
    try {
      const result = await findDuplicatePhotos();
      setGroups(result);
      await recordUsage(user.uid, 'duplicateFinder');
    } catch (err) {
      Alert.alert('সমস্যা', 'স্ক্যান করা যায়নি।');
    } finally {
      setScanning(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteSelected = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;
    const ok = await deleteAssets(ids);
    if (ok) {
      Alert.alert('সফল', `${ids.length}টি ফাইল ডিলিট করা হয়েছে।`);
      setGroups((prev) => prev.map((g) => g.filter((a) => !ids.includes(a.id))).filter((g) => g.length > 1));
      setSelected({});
    } else {
      Alert.alert('সমস্যা', 'ডিলিট করা যায়নি।');
    }
  };

  if (!groups) {
    return (
      <View style={styles.centered}>
        <Ionicons name="copy-outline" size={48} color={COLORS.secondary} />
        <Text style={styles.introText}>গ্যালারিতে একই সাইজের (সম্ভাব্য ডুপ্লিকেট) ছবি খুঁজে বের করবে।</Text>
        {!allowed && (
          <Text style={styles.limitNote}>ফ্রি প্ল্যানে দিনে {limit}বার স্ক্যান করা যায় - আজকের লিমিট শেষ।</Text>
        )}
        <AppButton
          label={allowed ? 'স্ক্যান শুরু করুন' : 'Premium প্রয়োজন'}
          variant={allowed ? 'primary' : 'locked'}
          icon="search"
          onPress={startScan}
          loading={scanning}
        />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="checkmark-circle" size={48} color={COLORS.primary} />
        <Text style={styles.introText}>কোনো ডুপ্লিকেট পাওয়া যায়নি। গ্যালারি পরিষ্কার আছে।</Text>
      </View>
    );
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(_, idx) => `group-${idx}`}
        contentContainerStyle={{ padding: SPACING.md }}
        renderItem={({ item: group }) => (
          <View style={styles.groupCard}>
            <Text style={styles.groupLabel}>
              {group.length}টি একই সাইজের ফাইল ({formatBytes(group[0].size)})
            </Text>
            <View style={styles.photoRow}>
              {group.map((asset) => (
                <TouchableOpacity key={asset.id} onPress={() => toggleSelect(asset.id)}>
                  <Image source={{ uri: asset.uri }} style={styles.photo} />
                  {selected[asset.id] && (
                    <View style={styles.checkOverlay}>
                      <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <AppButton
          label={selectedCount > 0 ? `${selectedCount}টি ডিলিট করুন` : 'ডিলিট করার জন্য বেছে নিন'}
          variant="danger"
          icon="trash-bin"
          onPress={handleDeleteSelected}
          disabled={selectedCount === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  introText: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  limitNote: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.premiumGold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  groupCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  groupLabel: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap' },
  photo: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  checkOverlay: {
    position: 'absolute',
    top: 2,
    right: 10,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
