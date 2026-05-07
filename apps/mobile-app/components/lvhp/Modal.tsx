import React from 'react';
import { StyleSheet, Modal as RNModal, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Typography } from './Typography';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.content, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Typography type="h3">{title}</Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <IconSymbol name="xmark" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.body}>
            {children}
          </View>
        </SafeAreaView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    height: Dimensions.get('window').height * 0.9,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    flex: 1,
    padding: 24,
  },
});
