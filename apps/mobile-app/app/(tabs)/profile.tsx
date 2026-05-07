import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Button } from '@/components/lvhp/Button';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
          <Text style={{ fontSize: 40 }}>👤</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>Người dùng</Text>
        <Text style={[styles.email, { color: theme.icon }]}>user@longvonghp.vn</Text>
      </View>

      <View style={styles.menu}>
        {[
          { icon: '🏆', label: 'Huy hiệu của tôi' },
          { icon: '🎟️', label: 'Voucher đã nhận' },
          { icon: '❤️', label: 'Quán yêu thích' },
          { icon: '⚙️', label: 'Cài đặt' },
        ].map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.menuItem, { backgroundColor: theme.surface, borderBottomWidth: index === 3 ? 0 : 1, borderBottomColor: theme.border }]}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <Button 
          label="Đăng xuất" 
          variant="outline" 
          onPress={() => {}} 
          style={{ marginTop: 24, borderColor: '#EF4444' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  menu: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
