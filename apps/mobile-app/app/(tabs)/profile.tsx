import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/lvhp/Button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const menuItems = [
  { icon: '🏆', label: 'My badges' },
  { icon: '🎟', label: 'Saved vouchers' },
  { icon: '♡', label: 'Favorite shops' },
  { icon: '⚙', label: 'Settings' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
          <Text style={styles.avatarText}>MT</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>Minh Tam</Text>
        <Text style={[styles.email, { color: theme.icon }]}>minhtamnghp03@gmail.com</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={[styles.menuItem, { backgroundColor: theme.surface }]}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <Button label="Sign out" variant="outline" onPress={() => {}} style={styles.signOutButton} />
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
  avatarText: {
    color: '#FF6B35',
    fontSize: 28,
    fontWeight: '900',
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
  signOutButton: {
    marginTop: 24,
    borderColor: '#EF4444',
  },
});
