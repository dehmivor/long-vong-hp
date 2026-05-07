import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, FlatList } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Typography } from './Typography';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Modal } from './Modal';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function Select({ label, options, value, onSelect, placeholder }: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.container}>
      {label && <Typography type="label" style={styles.label}>{label}</Typography>}
      
      <TouchableOpacity 
        style={[styles.trigger, { backgroundColor: theme.surface, borderColor: theme.border }]} 
        onPress={() => setModalVisible(true)}
      >
        <Typography 
          color={selectedOption ? theme.text : theme.icon}
          style={{ fontSize: 15 }}
        >
          {selectedOption ? selectedOption.label : placeholder || "Chọn một mục..."}
        </Typography>
        <IconSymbol name="chevron.up.chevron.down" size={16} color={theme.icon} />
      </TouchableOpacity>

      <Modal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        title={label || "Chọn một mục"}
      >
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.option, 
                { borderBottomColor: theme.border },
                item.value === value && { backgroundColor: 'rgba(255, 107, 53, 0.05)' }
              ]}
              onPress={() => {
                onSelect(item.value);
                setModalVisible(false);
              }}
            >
              <Typography 
                type="bodySemi" 
                color={item.value === value ? '#FF6B35' : theme.text}
              >
                {item.label}
              </Typography>
              {item.value === value && (
                <IconSymbol name="checkmark" size={20} color="#FF6B35" />
              )}
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  trigger: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
});
