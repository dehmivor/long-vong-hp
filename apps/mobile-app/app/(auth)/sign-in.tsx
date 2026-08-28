import { useTranslation } from '@repo/i18n';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/lvhp/Button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { t } = useTranslation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('auth.invalidEmail'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (signInError) {
      setError(signInError);
      return;
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.brand, { color: theme.text }]}>
            Lòng Vòng <Text style={styles.brandAccent}>HP</Text>
          </Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>{t('auth.signInToContinue')}</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.icon }]}>{t('auth.email')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={theme.icon}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />

          <Text style={[styles.label, { color: theme.icon }]}>{t('auth.password')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={theme.icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            label={t('auth.signIn')}
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submit}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={styles.switchRow}>
            <Text style={[styles.switchText, { color: theme.icon }]}>{t('auth.noAccount')} </Text>
            <Text style={styles.switchLink}>{t('auth.signUp')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.skip}>
            <Text style={[styles.switchText, { color: theme.icon }]}>{t('auth.skip')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  brand: { fontSize: 32, fontWeight: '900' },
  brandAccent: { color: '#FF6B35' },
  subtitle: { fontSize: 15, marginTop: 8 },
  form: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 12 },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 12,
    fontWeight: '600',
  },
  submit: { marginTop: 24 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, color: '#FF6B35', fontWeight: '700' },
  skip: { alignItems: 'center', marginTop: 16 },
});
