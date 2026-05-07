import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Typography } from './Typography';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function Header({ title, showBack = true, rightElement }: HeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <SafeAreaView style={{ backgroundColor: theme.background }}>
      <View style={[styles.container, { borderBottomColor: theme.border }]}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <IconSymbol name="chevron.left" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
        
        <Typography type="h3" style={styles.title} numberOfLines={1}>
          {title}
        </Typography>

        <View style={styles.right}>
          {rightElement}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  left: {
    width: 44,
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
  },
  backBtn: {
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
