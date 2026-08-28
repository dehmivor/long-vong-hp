import { useTranslation } from '@repo/i18n';
import { localized, type QuestWithProgress, type UserBadge } from '@repo/types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/lvhp/Button';
import { isSupabaseReady } from '@/constants/supabase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/i18n-provider';

export default function QuestsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { session } = useAuth();

  const [quests, setQuests] = useState<QuestWithProgress[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(isSupabaseReady);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseReady) {
      setLoading(false);
      return;
    }
    try {
      const { getQuestsWithProgress, getMyBadges } = await import('@repo/api-client/quests');
      const [questResult, badgeResult] = await Promise.all([
        getQuestsWithProgress(),
        session ? getMyBadges() : Promise.resolve({ data: [], error: null }),
      ]);

      setQuests(questResult.data ?? []);
      setBadges(badgeResult.data ?? []);
    } catch {
      setQuests([]);
      setBadges([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  // Re-read on focus so a fresh check-in shows up the moment the user returns.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.title, { color: theme.text }]}>{t('quests.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>{t('quests.subtitle')}</Text>

      <Button
        label={t('checkin.title')}
        onPress={() => router.push('/checkin')}
        style={styles.scanButton}
      />

      {!session && (
        <View style={[styles.notice, { backgroundColor: theme.surface }]}>
          <Text style={[styles.noticeText, { color: theme.icon }]}>{t('quests.signInPrompt')}</Text>
          <Button
            label={t('auth.signIn')}
            variant="outline"
            size="sm"
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.noticeButton}
          />
        </View>
      )}

      {loading && (
        <ActivityIndicator color="#FF6B35" style={styles.loader} />
      )}

      {!loading && quests.length === 0 && (
        <Text style={[styles.empty, { color: theme.icon }]}>{t('common.empty')}</Text>
      )}

      {quests.map((quest) => {
        const { completed_count: done, required_count: total } = quest.progress;
        const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

        return (
          <View key={quest.id} style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.badgeIcon}>{quest.progress.is_completed ? '🏆' : '🎯'}</Text>
              <View style={styles.cardHeaderText}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {localized(quest, 'name', language)}
                </Text>
                <Text style={[styles.cardDesc, { color: theme.icon }]}>
                  {localized(quest, 'description', language)}
                </Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: theme.icon }]}>
                {t('quests.progress')}
              </Text>
              <Text style={styles.progressValue}>
                {done}/{total}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>

            <View style={styles.rewardRow}>
              <Text
                style={[
                  styles.statusPill,
                  quest.progress.is_completed ? styles.statusDone : styles.statusOngoing,
                ]}
              >
                {quest.progress.is_completed ? t('quests.completed') : t('quests.inProgress')}
              </Text>
              {quest.voucher_discount_pct ? (
                <Text style={[styles.reward, { color: theme.icon }]}>
                  {t('quests.reward')}: {t('quests.voucherDiscount', { pct: quest.voucher_discount_pct })}
                </Text>
              ) : null}
            </View>

            {quest.progress.is_completed && quest.voucher_code ? (
              <View style={styles.voucher}>
                <Text style={styles.voucherLabel}>{t('quests.voucherCode')}</Text>
                <Text style={styles.voucherCode}>{quest.voucher_code}</Text>
              </View>
            ) : null}
          </View>
        );
      })}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('quests.myBadges')}</Text>
      {badges.length === 0 ? (
        <Text style={[styles.empty, { color: theme.icon }]}>{t('quests.noBadges')}</Text>
      ) : (
        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <View key={badge.id} style={[styles.badgeChip, { backgroundColor: theme.surface }]}>
              <Text style={styles.badgeChipIcon}>🏅</Text>
              <Text style={[styles.badgeChipText, { color: theme.text }]} numberOfLines={2}>
                {badge.quest ? localized(badge.quest, 'name', language) : t('quests.badgeEarned')}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 72, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 6 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  scanButton: { marginBottom: 20 },
  notice: { borderRadius: 16, padding: 16, marginBottom: 20, gap: 12 },
  noticeText: { fontSize: 14, lineHeight: 20 },
  noticeButton: { alignSelf: 'flex-start' },
  loader: { paddingVertical: 24 },
  empty: { fontSize: 14, paddingVertical: 16 },
  card: { borderRadius: 20, padding: 18, marginBottom: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', gap: 14 },
  badgeIcon: { fontSize: 34 },
  cardHeaderText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 19 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 13, fontWeight: '600' },
  progressValue: { fontSize: 13, fontWeight: '800', color: '#FF6B35' },
  progressTrack: { height: 8, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF6B35', borderRadius: 99 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  statusPill: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
  statusDone: { color: '#10B981', backgroundColor: 'rgba(16,185,129,0.15)' },
  statusOngoing: { color: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.15)' },
  reward: { fontSize: 12 },
  voucher: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#10B981',
    padding: 12,
    alignItems: 'center',
  },
  voucherLabel: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  voucherCode: { fontSize: 20, fontWeight: '900', color: '#10B981', letterSpacing: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginTop: 16, marginBottom: 12 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeChip: {
    width: '47%',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  badgeChipIcon: { fontSize: 28 },
  badgeChipText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  bottomSpacer: { height: 100 },
});
