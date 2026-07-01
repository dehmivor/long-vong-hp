import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from './Typography';

interface SliderProps {
  label?: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

export function Slider({ label, min, max, value, onChange, suffix = '' }: SliderProps) {
  const width = 300; // Fixed width for simple custom slider
  const thumbSize = 24;
  
  const percentage = (value - min) / (max - min);
  const left = percentage * (width - thumbSize);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {label && <Typography type="label">{label}</Typography>}
        <Typography type="bodySemi" color="#FF6B35">{value}{suffix}</Typography>
      </View>
      
      <View style={[styles.track, { width }]}>
        <View style={[styles.filledTrack, { width: left + thumbSize / 2 }]} />
        <View style={[styles.thumb, { left }]} />
      </View>
      
      <View style={[styles.footer, { width }]}>
        <Typography type="caption">{min}{suffix}</Typography>
        <Typography type="caption">{max}{suffix}</Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginBottom: 16,
  },
  track: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    position: 'relative',
  },
  filledTrack: {
    height: 6,
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -9,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
