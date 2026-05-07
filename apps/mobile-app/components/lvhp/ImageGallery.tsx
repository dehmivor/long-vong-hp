import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Typography } from './Typography';

interface ImageGalleryProps {
  images: string[];
}

const { width } = Dimensions.get('window');

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((img, i) => (
          <Image key={i} source={{ uri: img }} style={styles.image} />
        ))}
        {images.length === 0 && (
          <View style={styles.placeholder}>
            <Typography type="caption">Không có hình ảnh</Typography>
          </View>
        )}
      </ScrollView>
      
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                { backgroundColor: i === activeIndex ? '#FF6B35' : 'rgba(255,255,255,0.5)' }
              ]} 
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: width * 0.75,
    position: 'relative',
  },
  image: {
    width: width,
    height: '100%',
  },
  placeholder: {
    width: width,
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
