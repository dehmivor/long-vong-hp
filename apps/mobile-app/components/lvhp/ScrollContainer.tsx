import React, { useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, ViewStyle } from 'react-native';

interface ScrollContainerProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  style?: ViewStyle;
}

export function ScrollContainer({ children, onRefresh, style }: ScrollContainerProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={[styles.container, style]}
      refreshControl={
        onRefresh ? (
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            tintColor="#FF6B35"
            colors={['#FF6B35']}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
