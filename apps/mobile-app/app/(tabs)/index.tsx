import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/lvhp/Button';
import { QuestCard } from '@/components/lvhp/QuestCard';
import { ShopCard } from '@/components/lvhp/ShopCard';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.icon }]}>Chào buổi sáng! 👋</Text>
          <Text style={[styles.brand, { color: theme.text }]}>Lòng Vòng <Text style={{ color: '#FF6B35' }}>HP</Text></Text>
        </View>
        <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: theme.surface }]}>
          <IconSymbol name="bell.fill" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: '#FF6B35' }]}>
        <Text style={styles.heroTitle}>Khám phá Hải Phòng chuẩn bản địa</Text>
        <Text style={styles.heroSubtitle}>Săn lùng 500+ quán ngon cùng người bản địa ngay hôm nay.</Text>
        <Button 
          label="Khám phá ngay" 
          variant="secondary" 
          size="sm" 
          onPress={() => {}} 
          style={{ alignSelf: 'flex-start', backgroundColor: '#fff' }}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Danh mục</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {['🍜 Đặc sản', '🦐 Hải sản', '☕ Cà phê', '🥖 Bánh mì', '🍡 Ăn vặt'].map((cat, i) => (
            <TouchableOpacity key={i} style={[styles.categoryChip, { backgroundColor: theme.surface }]}>
              <Text style={[styles.categoryText, { color: theme.text }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Quests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 0, marginBottom: 0 }]}>Thử thách (Quests)</Text>
          <TouchableOpacity><Text style={{ color: '#FF6B35', fontWeight: '600' }}>Xem tất cả</Text></TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <QuestCard 
            title="Ngũ đại món ngon HP" 
            description="Check-in 5 quán đặc sản để nhận Voucher 50k" 
            icon="🏆" 
            onPress={() => {}} 
          />
        </View>
      </View>

      {/* Recommended Shops */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 0, marginBottom: 0 }]}>Quán ngon gần bạn</Text>
          <TouchableOpacity><Text style={{ color: '#FF6B35', fontWeight: '600' }}>Xem thêm</Text></TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <ShopCard 
            name="Bánh Đa Cua Bà Cụ"
            address="12 Đinh Tiên Hoàng, Hồng Bàng"
            rating={4.8}
            status="open"
            isLocalPick={true}
            category="Đặc sản HP"
            onPress={() => {}}
          />
          <ShopCard 
            name="Bánh Mì Que Phượng Đỏ"
            address="78 Lê Lợi, Lê Chân"
            rating={4.3}
            status="sold_out"
            isLocalPick={false}
            category="Bánh mì"
            onPress={() => {}}
          />
        </View>
      </View>
      
      <View style={{ height: 100 }} />
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
    letterSpacing: -0.5,
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
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  heroBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: '#FF6B35',
    fontWeight: '700',
    fontSize: 14,
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
  questCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  questName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  questDesc: {
    fontSize: 13,
  },
});
