import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/lvhp/Button';
import { QuestCard } from '@/components/lvhp/QuestCard';
import { ShopCard } from '@/components/lvhp/ShopCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const categories = ['Dac san', 'Hai san', 'Ca phe', 'Banh mi', 'An vat'];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.icon }]}>Good morning</Text>
          <Text style={[styles.brand, { color: theme.text }]}>
            Long Vong <Text style={styles.brandAccent}>HP</Text>
          </Text>
        </View>
        <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: theme.surface }]}>
          <IconSymbol name="bell.fill" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Kham pha Hai Phong chuan ban dia</Text>
        <Text style={styles.heroSubtitle}>
          Tim quan ngon, xem reels, check-in quest va nhan voucher tu doi tac dia phuong.
        </Text>
        <Button
          label="Kham pha ngay"
          variant="secondary"
          size="sm"
          onPress={() => {}}
          style={styles.heroButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Danh muc</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((category) => (
            <TouchableOpacity key={category} style={[styles.categoryChip, { backgroundColor: theme.surface }]}>
              <Text style={[styles.categoryText, { color: theme.text }]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 0, marginBottom: 0 }]}>
            Quest noi bat
          </Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Xem tat ca</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionBody}>
          <QuestCard
            title="Ngu dai mon ngon HP"
            description="Check-in 5 quan dac san de nhan voucher 50k."
            icon="🏆"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 0, marginBottom: 0 }]}>
            Gan ban
          </Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Xem them</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionBody}>
          <ShopCard
            name="Banh da cua Ba Cu"
            address="12 Dinh Tien Hoang, Hong Bang"
            rating={4.8}
            status="open"
            isLocalPick
            category="Dac san HP"
            onPress={() => {}}
          />
          <ShopCard
            name="Banh mi que Phuong Do"
            address="78 Le Loi, Le Chan"
            rating={4.3}
            status="sold_out"
            isLocalPick={false}
            category="Banh mi"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
  },
  brand: {
    fontSize: 24,
    fontWeight: '900',
  },
  brandAccent: {
    color: '#FF6B35',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    backgroundColor: '#FF6B35',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  sectionBody: {
    paddingHorizontal: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});
