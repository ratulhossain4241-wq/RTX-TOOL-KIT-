import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { submitPaymentRequest } from '../../services/subscriptionService';

// TODO: replace with your real bKash/Nagad Merchant/Personal numbers
const PAYMENT_NUMBERS = {
  bkash: '01725218874',
  nagad: '01725218874',
};

/**
 * PaymentRequestScreen
 * ---------------------
 * User picks bKash or Nagad, sees the number to send money to (Send Money,
 * not Payment - avoids extra charge), then submits their own number +
 * transaction ID. This just creates a "pending" request - your Telegram
 * bot approves it manually, which is what actually unlocks premium.
 */
export default function PaymentRequestScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [method, setMethod] = useState('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await submitPaymentRequest({
        userId: user.uid,
        userEmail: profile?.email || user.email,
        method,
        senderNumber,
        transactionId,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="time-outline" size={56} color={COLORS.primary} />
        <Text style={styles.pendingTitle}>রিকোয়েস্ট পাঠানো হয়েছে</Text>
        <Text style={styles.pendingSub}>
          এডমিন যাচাই করে অনুমোদন দিলেই আপনার একাউন্ট Premium হয়ে যাবে। এটা সাধারণত কিছুক্ষণের
          মধ্যেই হয়ে যায়।
        </Text>
        <AppButton label="ড্যাশবোর্ডে ফিরে যান" variant="secondary" onPress={() => navigation.popToTop()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>PAYMENT</Text>

        <View style={styles.methodRow}>
          {['bkash', 'nagad'].map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.methodBtn, method === m && styles.methodBtnActive]}
              onPress={() => setMethod(m)}
            >
              <Text style={[styles.methodText, method === m && styles.methodTextActive]}>
                {m === 'bkash' ? 'bKash' : 'Nagad'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionLabel}>এই নাম্বারে ৳১০০০ Send Money করুন:</Text>
          <Text style={styles.number}>{PAYMENT_NUMBERS[method]}</Text>
          <Text style={styles.instructionNote}>
            Send Money অপশন ব্যবহার করুন (Payment না) - অতিরিক্ত চার্জ এড়াতে।
          </Text>
        </View>

        <Text style={styles.label}>আপনার {method === 'bkash' ? 'bKash' : 'Nagad'} নাম্বার</Text>
        <TextInput
          style={styles.input}
          value={senderNumber}
          onChangeText={setSenderNumber}
          placeholder="01XXXXXXXXX"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Transaction ID</Text>
        <TextInput
          style={styles.input}
          value={transactionId}
          onChangeText={setTransactionId}
          placeholder="যেমন: 8N7A2XXXX"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="characters"
        />

        {!!error && <Text style={styles.error}>⚠ {error}</Text>}

        <AppButton label="রিকোয়েস্ট সাবমিট করুন" variant="primary" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.xl,
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  methodRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  methodBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  methodBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceAlt,
  },
  methodText: { fontFamily: FONTS.mono, color: COLORS.textSecondary },
  methodTextActive: { color: COLORS.primary, fontFamily: FONTS.monoBold },
  instructionBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  instructionLabel: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  number: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.xl,
    color: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  instructionNote: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
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
  pendingTitle: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  pendingSub: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});
