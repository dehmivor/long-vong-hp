import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Typography } from './Typography';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ActionItem {
  id: string;
  label: string;
  icon?: any;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionItem[];
  onAction: (id: string) => void;
}

export function ActionSheet({ visible, onClose, title, actions, onAction }: ActionSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          {title && (
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <Typography type="label" color={theme.icon}>{title}</Typography>
            </View>
          )}
          
          <View style={styles.list}>
            {actions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={[styles.item, { borderBottomColor: theme.border }]}
                onPress={() => {
                  onAction(action.id);
                  onClose();
                }}
              >
                {action.icon && (
                  <IconSymbol 
                    name={action.icon} 
                    size={22} 
                    color={action.destructive ? '#EF4444' : theme.text} 
                    style={styles.icon}
                  />
                )}
                <Typography 
                  type="bodySemi" 
                  color={action.destructive ? '#EF4444' : theme.text}
                >
                  {action.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Typography type="bodySemi" color={theme.icon}>Hủy bỏ</Typography>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  list: {
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 16,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 18,
    alignItems: 'center',
  },
});
