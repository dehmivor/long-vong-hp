import { useTranslation } from '@repo/i18n';
import { localized, type QuestWithProgress } from '@repo/types';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/lvhp/Button';
import { QuestCard } from '@/components/lvhp/QuestCard';
import { ShopCard } from '@/components/lvhp/ShopCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { isSupabaseReady } from '@/constants/supabase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShops } from '@/hooks/use-shops';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/i18n-provider';

const CATEGORY_KEYS = ['dac-san-hp', 'hai-san', 'ca-phe', 'banh-mi-bun', 'com-pho'] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORY_KEYS)[number], Record<string, string>> = {
  'dac-san-hp': { vi: 'Đặc sản', en: 'Specialties', ko: '특산품' },
  'hai-san': { vi: 'Hải sản', en: 'Seafood', ko: '해산물' },
  'ca-phe': { vi: 'Cà phê', en: 'Coffee', ko: '커피' },
  'banh-mi-bun': { vi: 'Bánh mì & Bún', en: 'Bánh mì & Noodles', ko: '바인미 & 국수' },
  'com-pho': { vi: 'Cơm & Phở', en: 'Rice & Pho', ko: '밥 & 쌀국수' },
};

function greetingKey(hour: number): 'home.greetingMorning' | 'home.greetingAfternoon' | 'home.greetingEvening' {
  if (hour < 12) return 'home.greetingMorning';
  if (hour < 18) return 'home.greetingAfternoon';
  return 'home.greetingEvening';
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { session } = useAuth();
  const { shops, loading } = useShops();

  const [featuredQuest, setFeaturedQuest] = useState<QuestWithProgress | null>(null);
  const nearbyShops = shops.slice(0, 4);

  const loadQuest = useCallback(async () => {
    if (!isSupabaseReady) return;
    try {
      const { getQuestsWithProgress } = await import('@repo/api-client/quests');
      const { data } = await getQuestsWithProgress();
      setFeaturedQuest(data?.[0] ?? null);
    } catch {
      setFeaturedQuest(null);
    }
  }, []);

  useEffect(() => {
    void loadQuest();
  }, [loadQuest, session]);

  const questTitle = featuredQuest
    ? localized(featuredQuest, 'name', language)
    : 'Ngũ đại món ngon HP';
  const questDescription = featuredQuest
    ? localized(featuredQuest, 'description', language)
    : t('quests.subtitle');

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.icon }]}>
            {t(greetingKey(new Date().getHours()))}
          </Text>
          <Text style={[styles.brand, { color: theme.text }]}>
            Lòng Vòng <Text style={styles.brandAccent}>HP</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.notificationBtn, { backgroundColor: theme.surface }]}
          onPress={() => router.push('/checkin')}
        >
          <IconSymbol name="qrcode" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
        <Text style={styles.heroSubtitle}>{t('home.heroSubtitle')}</Text>
        <Button
          label={t('home.heroCta')}
          variant="secondary"
          size="sm"
          onPress={() => router.push('/(tabs)/map')}
          style={styles.heroButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('home.categories')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORY_KEYS.map((slug) => (
            <TouchableOpacity
              key={slug}
              style={[styles.categoryChip, { backgroundColor: theme.surface }]}
              onPress={() => router.push('/(tabs)/map')}
            >
              <Text style={[styles.categoryText, { color: theme.text }]}>
                {CATEGORY_LABELS[slug][language] ?? CATEGORY_LABELS[slug].vi}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, styles.inlineTitle, { color: theme.text }]}>
            {t('home.featuredQuest')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/quests')}>
            <Text style={styles.linkText}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionBody}>
          <QuestCard
            title={questTitle}
            description={questDescription}
            icon="🏆"
            onPress={() => router.push('/(tabs)/quests')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, styles.inlineTitle, { color: theme.text }]}>
            {t('home.nearby')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
            <Text style={styles.linkText}>{t('common.seeMore')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionBody}>
          {loading && nearbyShops.length === 0 ? (
            <ActivityIndicator color="#FF6B35" style={styles.loader} />
          ) : (
            nearbyShops.map((shop) => (
              <ShopCard
                key={shop.id}
                name={shop.name}
                address={shop.address}
                rating={shop.rating_avg}
                status={shop.status === 'temporarily_closed' ? 'closed' : shop.status}
                isLocalPick={shop.is_local_pick}
                category={shop.category ?? t('map.localPick')}
                onPress={() => router.push(`/shop/${shop.id}`)}
              />
            ))
          )}
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
  },
  brand: {
    fontSize: 24,
    fontWeight: '900',
  },
  brandAccent: {
    color: '#FF6B35',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    backgroundColor: '#FF6B35',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inlineTitle: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  sectionBody: {
    paddingHorizontal: 20,
  },
  loader: {
    paddingVertical: 24,
  },
  bottomSpacer: {
    height: 100,
  },
});
