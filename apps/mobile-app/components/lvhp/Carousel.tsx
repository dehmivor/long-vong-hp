import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Typography } from './Typography';

interface CarouselItem {
  image: string;
  title: string;
}

interface CarouselProps {
  items: CarouselItem[];
}

const { width } = Dimensions.get('window');
export function Carousel({ items }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          setActiveIndex(Math.round(x / width));
        }}
        scrollEventThrottle={16}
      >
        {items.map((item, i) => (
          <View key={i} style={styles.cardContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.overlay}>
              <Typography type="h3" color="#FFFFFF">{item.title}</Typography>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.pagination}>
        {items.map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.dot, 
              { backgroundColor: i === activeIndex ? '#FF6B35' : 'rgba(255,255,255,0.3)', width: i === activeIndex ? 20 : 8 }
            ]} 
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    marginVertical: 20,
  },
  cardContainer: {
    width: width,
    paddingHorizontal: 20,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
