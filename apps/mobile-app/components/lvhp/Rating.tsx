import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface RatingProps {
  rating: number;
  max?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

export function Rating({ rating, max = 5, onRatingChange, size = 20 }: RatingProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: max }).map((_, i) => {
        const index = i + 1;
        const isFilled = index <= rating;
        
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onRatingChange?.(index)}
            disabled={!onRatingChange}
            activeOpacity={0.7}
          >
            <IconSymbol 
              name={isFilled ? "star.fill" : "star"} 
              size={size} 
              color={isFilled ? "#F59E0B" : "#D1D5DB"} 
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
});
