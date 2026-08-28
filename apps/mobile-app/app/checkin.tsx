import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@repo/i18n';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/lvhp/Button';
import { isSupabaseReady } from '@/constants/supabase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { parseShopQr } from '@/lib/qr';
import { useAuth } from '@/providers/auth-provider';

type Phase = 'scanning' | 'verifying' | 'success' | 'failed';

export default function CheckinScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { t } = useTranslation();
  const { session } = useAuth();
  const params = useLocalSearchParams<{ shopId?: string }>();

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('scanning');
  const [message, setMessage] = useState<string | null>(null);
  // Barcode callbacks fire many times per second - latch so one scan runs once.
  const handling = useRef(false);

  const runCheckin = useCallback(
    async (shopId: string) => {
      setPhase('verifying');
      setMessage(null);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPhase('failed');
          setMessage(t('checkin.locationDenied'));
          return;
        }

        // High accuracy matters: the server rejects anything beyond 50m.
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { checkInAtShop } = await import('@repo/api-client/quests');
        const { data, error } = await checkInAtShop(
          shopId,
          position.coords.latitude,
          position.coords.longitude,
        );

        if (error) {
          setPhase('failed');
          switch (error.code) {
            case 'NOT_AUTHENTICATED':
              setMessage(t('checkin.notAuthenticated'));
              break;
            case 'TOO_FAR':
              setMessage(t('checkin.tooFar', { distance: Math.round(error.distanceM ?? 0) }));
              break;
            case 'ALREADY_CHECKED_IN_TODAY':
              setMessage(t('checkin.alreadyToday'));
              break;
            case 'SHOP_NOT_FOUND':
              setMessage(t('checkin.invalidCode'));
              break;
            default:
              setMessage(error.message);
          }
          return;
        }

        setPhase('success');
        setMessage(t('checkin.success', { points: data?.points_earned ?? 0 }));
      } catch (err) {
        setPhase('failed');
        setMessage(err instanceof Error ? err.message : t('common.error'));
      }
    },
    [t],
  );

  const handleScan = useCallback(
    ({ data }: { data: string }) => {
      if (handling.current) return;
      handling.current = true;

      const shopId = parseShopQr(data);
      if (!shopId) {
        setPhase('failed');
        setMessage(t('checkin.invalidCode'));
        return;
      }

      void runCheckin(shopId);
    },
    [runCheckin, t],
  );

  const reset = () => {
    handling.current = false;
    setPhase('scanning');
    setMessage(null);
  };

  // ---- Gate: signed out ----
  if (!session) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={[styles.title, { color: theme.text }]}>{t('checkin.title')}</Text>
        <Text style={[styles.body, { color: theme.icon }]}>{t('checkin.notAuthenticated')}</Text>
        <Button
          label={t('auth.signIn')}
          onPress={() => router.replace('/(auth)/sign-in')}
          style={styles.action}
        />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.link, { color: theme.icon }]}>{t('common.close')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- Gate: camera permission ----
  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color="#FF6B35" />
        <Text style={[styles.body, { color: theme.icon }]}>{t('checkin.requestingCamera')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={styles.emoji}>📷</Text>
        <Text style={[styles.title, { color: theme.text }]}>{t('checkin.title')}</Text>
        <Text style={[styles.body, { color: theme.icon }]}>{t('checkin.cameraDenied')}</Text>
        <Button
          label={t('checkin.grantCamera')}
          onPress={() => void requestPermission()}
          style={styles.action}
        />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.link, { color: theme.icon }]}>{t('common.close')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- Result states ----
  if (phase !== 'scanning') {
    const succeeded = phase === 'success';
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        {phase === 'verifying' ? (
          <>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={[styles.body, { color: theme.icon }]}>{t('checkin.verifying')}</Text>
          </>
        ) : (
          <>
            <Text style={styles.emoji}>{succeeded ? '🎉' : '⚠️'}</Text>
            <Text style={[styles.title, { color: succeeded ? '#10B981' : '#EF4444' }]}>
              {succeeded ? t('quests.completed') : t('common.error')}
            </Text>
            <Text style={[styles.body, { color: theme.text }]}>{message}</Text>
            {succeeded ? (
              <Button
                label={t('quests.title')}
                onPress={() => router.replace('/(tabs)/quests')}
                style={styles.action}
              />
            ) : (
              <Button label={t('checkin.scanAgain')} onPress={reset} style={styles.action} />
            )}
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.link, { color: theme.icon }]}>{t('common.close')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  // ---- Scanner ----
  return (
    <View style={styles.flex}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScan}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.overlayTitle}>{t('checkin.title')}</Text>
        <Text style={styles.overlaySubtitle}>{t('checkin.subtitle')}</Text>

        <View style={styles.reticle} />

        <Text style={styles.overlayPrompt}>{t('checkin.scanPrompt')}</Text>

        {!isSupabaseReady && <Text style={styles.warning}>{t('common.demoData')}</Text>}

        {params.shopId ? (
          <TouchableOpacity
            style={styles.manualBtn}
            onPress={() => {
              handling.current = true;
              void runCheckin(String(params.shopId));
            }}
          >
            <Text style={styles.manualText}>{t('shop.checkinCta')}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>{t('common.close')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emoji: { fontSize: 56 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  body: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  action: { marginTop: 16, alignSelf: 'stretch' },
  link: { marginTop: 12, fontSize: 14, fontWeight: '600' },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  overlayTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  overlaySubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
  },
  reticle: {
    width: 240,
    height: 240,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FF6B35',
  },
  overlayPrompt: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  warning: { color: '#FCD34D', fontSize: 12, fontWeight: '700', marginTop: 12 },
  manualBtn: {
    marginTop: 24,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 99,
  },
  manualText: { color: '#fff', fontWeight: '700' },
  closeBtn: { position: 'absolute', bottom: 48 },
  closeText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
});
