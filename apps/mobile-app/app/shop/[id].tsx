import { useTranslation } from '@repo/i18n';
import { localized, type Review, type Shop } from '@repo/types';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/lvhp/Button';
import { DEMO_SHOPS } from '@/constants/demo-shops';
import { isSupabaseReady } from '@/constants/supabase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/i18n-provider';

/** Minimal shape the screen renders — a demo pin satisfies it too. */
type ShopView = Pick<Shop, 'id' | 'name' | 'address' | 'rating_avg' | 'status' | 'is_local_pick'> &
  Partial<Shop>;

function demoShop(id: string): ShopView | null {
  const match = DEMO_SHOPS.find((shop) => shop.id === id);
  if (!match) return null;
  return {
    id: match.id,
    name: match.name,
    address: match.address,
    rating_avg: match.rating_avg,
    status: match.status,
    is_local_pick: match.is_local_pick,
    rating_count: 0,
    checkin_count: 0,
  };
}

export default function ShopDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { session } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const shopId = String(id ?? '');

  const [shop, setShop] = useState<ShopView | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseReady) {
      setShop(demoShop(shopId));
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      const [{ getShopById }, { getShopReviews }] = await Promise.all([
        import('@repo/api-client/shops'),
        import('@repo/api-client/reviews'),
      ]);

      const { data } = await getShopById(shopId);
      // Fall back to the demo pin so deep links from the demo map still resolve.
      setShop(data ?? demoShop(shopId));

      const { data: reviewData } = await getShopReviews(shopId);
      setReviews(reviewData ?? []);
    } catch {
      setShop(demoShop(shopId));
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitReview = async () => {
    if (!session) {
      router.push('/(auth)/sign-in');
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const { createReview } = await import('@repo/api-client/reviews');
      const { error } = await createReview({
        shop_id: shopId,
        rating,
        content: content.trim(),
        images: [],
      });

      if (error) {
        setNotice(error.message);
        return;
      }

      setContent('');
      setNotice(t('shop.reviewSubmitted'));
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={styles.emoji}>🔍</Text>
        <Text style={[styles.notFound, { color: theme.text }]}>{t('shop.notFound')}</Text>
        <Button label={t('common.close')} variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  const description = localized(shop, 'description', language);
  const statusKey = `shopStatus.${shop.status}`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.hero}>
        {shop.image_url ? (
          <Image source={{ uri: shop.image_url }} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.heroPlaceholder]}>
            <Text style={styles.heroEmoji}>🍜</Text>
          </View>
        )}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: theme.text }]}>{shop.name}</Text>
          <Text style={styles.rating}>⭐ {shop.rating_avg.toFixed(1)}</Text>
        </View>

        <View style={styles.badgeRow}>
          {shop.is_local_pick && (
            <Text style={styles.localBadge}>{t('map.localPick')}</Text>
          )}
          <Text style={[styles.statusBadge, shop.status !== 'open' && styles.statusMuted]}>
            {t(statusKey)}
          </Text>
          {shop.price_range && (
            <Text style={[styles.meta, { color: theme.icon }]}>
              {t(`priceRange.${shop.price_range}`)}
            </Text>
          )}
        </View>

        <Text style={[styles.meta, { color: theme.icon }]}>📍 {shop.address}</Text>
        {shop.phone ? (
          <Text style={[styles.meta, { color: theme.icon }]}>📞 {shop.phone}</Text>
        ) : null}
        {shop.open_time && shop.close_time ? (
          <Text style={[styles.meta, { color: theme.icon }]}>
            🕘 {t('shop.hours')}: {shop.open_time} – {shop.close_time}
          </Text>
        ) : null}
        {shop.busy_hours && shop.busy_hours.length > 0 ? (
          <Text style={[styles.meta, { color: theme.icon }]}>
            🔥 {t('shop.busyHours')}: {shop.busy_hours.join(', ')}
          </Text>
        ) : null}
        {typeof shop.checkin_count === 'number' ? (
          <Text style={[styles.meta, { color: theme.icon }]}>
            ✅ {shop.checkin_count} {t('shop.checkins')}
          </Text>
        ) : null}

        {description !== '' && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('shop.about')}</Text>
            <Text style={[styles.description, { color: theme.icon }]}>{description}</Text>
          </>
        )}

        <Button
          label={t('shop.checkinCta')}
          onPress={() => router.push(`/checkin?shopId=${shop.id}`)}
          style={styles.checkinBtn}
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('shop.reviews')} ({reviews.length})
        </Text>

        {reviews.length === 0 ? (
          <Text style={[styles.description, { color: theme.icon }]}>{t('shop.noReviews')}</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={[styles.review, { backgroundColor: theme.surface }]}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewAuthor, { color: theme.text }]}>
                  {review.user?.full_name?.trim() || t('auth.guest')}
                </Text>
                <Text style={styles.reviewStars}>{'⭐'.repeat(review.rating)}</Text>
              </View>
              {review.content ? (
                <Text style={[styles.reviewBody, { color: theme.icon }]}>{review.content}</Text>
              ) : null}
              {review.is_verified_visit && (
                <Text style={styles.verified}>✓ {t('shop.verifiedVisit')}</Text>
              )}
            </View>
          ))
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('shop.writeReview')}</Text>
        <View style={styles.starPicker}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity key={value} onPress={() => setRating(value)} hitSlop={6}>
              <Text style={styles.starPickerItem}>{value <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[styles.reviewInput, { backgroundColor: theme.surface, color: theme.text }]}
          placeholder={t('shop.reviewPlaceholder')}
          placeholderTextColor={theme.icon}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
        />
        {notice && <Text style={styles.notice}>{notice}</Text>}
        <Button
          label={session ? t('shop.submitReview') : t('auth.signInToContinue')}
          onPress={submitReview}
          loading={submitting}
          style={styles.submitBtn}
        />

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  emoji: { fontSize: 56 },
  notFound: { fontSize: 18, fontWeight: '800' },
  hero: { height: 240, backgroundColor: '#111827' },
  heroPlaceholder: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 72 },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  body: { padding: 20, gap: 8 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: '900', flex: 1, marginRight: 12 },
  rating: { color: '#F59E0B', fontWeight: '800', fontSize: 16 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  localBadge: {
    color: '#FF6B35',
    backgroundColor: 'rgba(255,107,53,0.15)',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
  statusBadge: {
    color: '#10B981',
    backgroundColor: 'rgba(16,185,129,0.15)',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
  statusMuted: { color: '#9CA3AF', backgroundColor: 'rgba(156,163,175,0.18)' },
  meta: { fontSize: 13, lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 20, marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 21 },
  checkinBtn: { marginTop: 20 },
  review: { borderRadius: 16, padding: 14, marginBottom: 10, gap: 6 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewAuthor: { fontSize: 14, fontWeight: '700' },
  reviewStars: { fontSize: 12 },
  reviewBody: { fontSize: 13, lineHeight: 19 },
  verified: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  starPicker: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  starPickerItem: { fontSize: 28 },
  reviewInput: {
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  notice: { color: '#10B981', fontSize: 13, fontWeight: '600', marginTop: 10 },
  submitBtn: { marginTop: 16 },
  bottomSpacer: { height: 60 },
});
