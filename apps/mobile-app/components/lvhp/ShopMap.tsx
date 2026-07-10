import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, type Region } from 'react-native-maps';

import { HAI_PHONG_REGION, type MapShop } from '@/constants/demo-shops';

const ORANGE = '#FF6B35';
const GREEN = '#10B981';
const GRAY = '#9CA3AF';

function pinColor(shop: MapShop): string {
  if (shop.status === 'sold_out' || shop.status === 'closed') return GRAY;
  if (shop.is_local_pick) return ORANGE;
  return GREEN;
}

export interface ShopMapProps {
  shops: MapShop[];
  selectedId: string | null;
  onSelectShop: (id: string) => void;
  focus: { latitude: number; longitude: number } | null;
  userLocation: { latitude: number; longitude: number } | null;
}

export function ShopMap({ shops, selectedId, onSelectShop, focus, userLocation }: ShopMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!focus) return;
    const region: Region = {
      latitude: focus.latitude,
      longitude: focus.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
    mapRef.current?.animateToRegion(region, 350);
  }, [focus]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_DEFAULT}
      initialRegion={HAI_PHONG_REGION}
      showsUserLocation={Boolean(userLocation)}
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      {shops.map((shop) => (
        <Marker
          key={shop.id}
          identifier={shop.id}
          coordinate={{ latitude: shop.latitude, longitude: shop.longitude }}
          title={shop.name}
          description={shop.address}
          pinColor={pinColor(shop)}
          zIndex={shop.id === selectedId ? 10 : 1}
          onPress={() => onSelectShop(shop.id)}
        />
      ))}
    </MapView>
  );
}
