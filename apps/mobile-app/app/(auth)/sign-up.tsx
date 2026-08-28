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

export default function SignUpScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { t } = useTranslation();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (fullName.trim() === '') {
      setError(t('auth.nameRequired'));
      return;
    }
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
    const { error: signUpError } = await signUp(email.trim(), password, fullName.trim());
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }
    // Supabase may require email confirmation, so there is not always a session
    // to navigate on — show the confirmation notice instead.
    setNotice(t('auth.signUpSuccess'));
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
          <Text style={[styles.subtitle, { color: theme.icon }]}>{t('auth.signUp')}</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.icon }]}>{t('auth.fullName')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            placeholder={t('auth.namePlaceholder')}
            placeholderTextColor={theme.icon}
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
          />

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
            autoComplete="new-password"
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {notice && <Text style={styles.notice}>{notice}</Text>}

          <Button
            label={t('auth.signUp')}
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submit}
          />

          <TouchableOpacity onPress={() => router.back()} style={styles.switchRow}>
            <Text style={[styles.switchText, { color: theme.icon }]}>{t('auth.hasAccount')} </Text>
            <Text style={styles.switchLink}>{t('auth.signIn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
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
  error: { color: '#EF4444', fontSize: 13, marginTop: 12, fontWeight: '600' },
  notice: { color: '#10B981', fontSize: 13, marginTop: 12, fontWeight: '600' },
  submit: { marginTop: 24 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, color: '#FF6B35', fontWeight: '700' },
});
