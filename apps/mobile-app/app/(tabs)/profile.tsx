import {
  LANGUAGE_FLAGS,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  useTranslation,
  type Language,
} from '@repo/i18n';
import type { UserBadge, UserCheckin } from '@repo/types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/lvhp/Button';
import { isSupabaseReady } from '@/constants/supabase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/i18n-provider';

function initials(name: string | undefined, email: string | undefined): string {
  const source = name?.trim() || email?.trim() || '';
  if (source === '') return '👋';
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { session, user, signOut } = useAuth();

  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [checkins, setCheckins] = useState<UserCheckin[]>([]);

  const load = useCallback(async () => {
    if (!isSupabaseReady || !session) {
      setBadges([]);
      setCheckins([]);
      return;
    }
    try {
      const { getMyBadges, getMyCheckins } = await import('@repo/api-client/quests');
      const [badgeResult, checkinResult] = await Promise.all([getMyBadges(), getMyCheckins()]);
      setBadges(badgeResult.data ?? []);
      setCheckins(checkinResult.data ?? []);
    } catch {
      setBadges([]);
      setCheckins([]);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const displayName = user?.full_name?.trim() || session?.user.email || t('auth.guest');
  const email = user?.email ?? session?.user.email ?? '';
  const points = checkins.reduce((sum, checkin) => sum + checkin.points_earned, 0);

  const stats = [
    { value: String(points), label: t('profile.points') },
    { value: String(badges.length), label: t('profile.badges') },
    { value: String(checkins.length), label: t('profile.checkins') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
          <Text style={styles.avatarText}>{initials(user?.full_name, email)}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
        {email !== '' && <Text style={[styles.email, { color: theme.icon }]}>{email}</Text>}
      </View>

      {session ? (
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.stat, { backgroundColor: theme.surface }]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.icon }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Button label={t('auth.signIn')} onPress={() => router.push('/(auth)/sign-in')} />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.language')}</Text>
        <View style={styles.languageRow}>
          {SUPPORTED_LANGUAGES.map((code: Language) => {
            const active = code === language;
            return (
              <TouchableOpacity
                key={code}
                style={[
                  styles.languageChip,
                  { backgroundColor: theme.surface },
                  active && styles.languageChipActive,
                ]}
                onPress={() => void setLanguage(code)}
                activeOpacity={0.85}
              >
                <Text style={styles.languageFlag}>{LANGUAGE_FLAGS[code]}</Text>
                <Text
                  style={[
                    styles.languageLabel,
                    { color: theme.text },
                    active && styles.languageLabelActive,
                  ]}
                >
                  {LANGUAGE_LABELS[code]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {session && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.myCheckins')}</Text>
          {checkins.length === 0 ? (
            <Text style={[styles.empty, { color: theme.icon }]}>{t('common.empty')}</Text>
          ) : (
            checkins.slice(0, 8).map((checkin) => (
              <TouchableOpacity
                key={checkin.id}
                style={[styles.row, { backgroundColor: theme.surface }]}
                onPress={() => router.push(`/shop/${checkin.shop_id}`)}
                activeOpacity={0.85}
              >
                <Text style={styles.rowIcon}>✅</Text>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
                    {checkin.shop?.name ?? checkin.shop_id}
                  </Text>
                  <Text style={[styles.rowMeta, { color: theme.icon }]}>
                    {new Date(checkin.checked_in_at).toLocaleDateString()} · +
                    {checkin.points_earned} {t('profile.points')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: theme.surface }]}
          onPress={() => router.push('/(tabs)/quests')}
          activeOpacity={0.85}
        >
          <Text style={styles.rowIcon}>🏆</Text>
          <Text style={[styles.rowTitle, { color: theme.text }]}>{t('profile.myBadges')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: theme.surface }]}
          onPress={() => router.push('/checkin')}
          activeOpacity={0.85}
        >
          <Text style={styles.rowIcon}>📷</Text>
          <Text style={[styles.rowTitle, { color: theme.text }]}>{t('checkin.title')}</Text>
        </TouchableOpacity>

        {session && (
          <Button
            label={t('auth.signOut')}
            variant="outline"
            onPress={() => void signOut()}
            style={styles.signOutButton}
          />
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 72 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarText: { color: '#FF6B35', fontSize: 28, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '800' },
  email: { fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 8 },
  stat: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#FF6B35' },
  statLabel: { fontSize: 12, marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  languageRow: { flexDirection: 'row', gap: 10 },
  languageChip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageChipActive: { borderColor: '#FF6B35' },
  languageFlag: { fontSize: 22 },
  languageLabel: { fontSize: 12, fontWeight: '700' },
  languageLabelActive: { color: '#FF6B35' },
  empty: { fontSize: 14, paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 14,
  },
  rowIcon: { fontSize: 20 },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowMeta: { fontSize: 12, marginTop: 2 },
  signOutButton: { marginTop: 14, borderColor: '#EF4444' },
  bottomSpacer: { height: 100 },
});
