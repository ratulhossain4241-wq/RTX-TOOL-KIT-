import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { registerUser } from '../../services/authService';

/**
 * RegisterScreen
 * --------------
 * Same visual language as LoginScreen so switching between them feels
 * seamless. Client-side validation runs BEFORE hitting Firebase, so the
 * user gets instant, clear feedback instead of waiting for a network error.
 */
export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim()) return 'নাম দিন।';
    if (!email.trim()) return 'ইমেইল দিন।';
    if (password.length < 6) return 'পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।';
    if (password !== confirmPassword) return 'দুটো পাসওয়ার্ড মিলছে না।';
    return '';
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerUser({ name: name.trim(), email: email.trim(), password });
      // AuthContext detects the new user automatically -> switches to Dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>CREATE ACCOUNT</Text>
        <Text style={styles.subtitle}>&gt; register new operator_</Text>

        <View style={styles.form}>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="কমপক্ষে ৬ ক্যারেক্টার"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
          />

          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
          />

          {!!error && <Text style={styles.error}>⚠ {error}</Text>}

          <AppButton label="CREATE ACCOUNT" variant="primary" onPress={handleRegister} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
            <Text style={styles.link}>আগে থেকে একাউন্ট আছে? Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  title: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.xl,
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
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
  linkWrap: { marginTop: SPACING.md, alignItems: 'center' },
  link: { color: COLORS.secondary, fontFamily: FONTS.mono, fontSize: FONTS.sizes.sm },
});
