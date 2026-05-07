import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TypographyProps {
  children: React.ReactNode;
  type?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySemi' | 'caption' | 'label';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export function Typography({ 
  children, 
  type = 'body', 
  color, 
  align = 'left', 
  style,
  numberOfLines 
}: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getStyle = () => {
    switch (type) {
      case 'h1': return styles.h1;
      case 'h2': return styles.h2;
      case 'h3': return styles.h3;
      case 'bodySemi': return styles.bodySemi;
      case 'caption': return styles.caption;
      case 'label': return styles.label;
      default: return styles.body;
    }
  };

  return (
    <Text 
      numberOfLines={numberOfLines}
      style={[
        getStyle(), 
        { color: color || theme.text, textAlign: align }, 
        style
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: { 
    fontSize: 32, 
    fontWeight: '900', 
    letterSpacing: -1, 
    lineHeight: 38,
    fontFamily: 'Outfit-Black' 
  },
  h2: { 
    fontSize: 24, 
    fontWeight: '800', 
    letterSpacing: -0.5, 
    lineHeight: 30,
    fontFamily: 'Outfit-Bold' 
  },
  h3: { 
    fontSize: 18, 
    fontWeight: '700', 
    lineHeight: 24,
    fontFamily: 'Outfit-SemiBold' 
  },
  body: { 
    fontSize: 15, 
    fontWeight: '400', 
    lineHeight: 22,
    fontFamily: 'Inter-Regular' 
  },
  bodySemi: { 
    fontSize: 15, 
    fontWeight: '600', 
    lineHeight: 22,
    fontFamily: 'Inter-SemiBold' 
  },
  caption: { 
    fontSize: 13, 
    fontWeight: '400', 
    lineHeight: 18,
    fontFamily: 'Inter-Regular' 
  },
  label: { 
    fontSize: 12, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 1,
    fontFamily: 'Inter-Bold' 
  },
});
