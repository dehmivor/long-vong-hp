import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const routes = [
  {
    title: 'Morning street food',
    subtitle: 'Banh da cua, banh mi que, cafe pho cu',
    time: '07:00 - 10:00',
  },
  {
    title: 'Do Son seafood run',
    subtitle: 'Quan hai san local pick va diem ngam bien',
    time: '16:00 - 20:00',
  },
  {
    title: 'Korean-friendly dinner',
    subtitle: 'Quan co menu EN/KO va vi tri de di taxi',
    time: '18:00 - 21:00',
  },
];

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Explore Hai Phong</Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>
        Curated routes for travelers, locals and food partners.
      </Text>

      <View style={styles.routeList}>
        {routes.map((route) => (
          <View key={route.title} style={[styles.routeCard, { backgroundColor: theme.surface }]}>
            <View style={styles.routeIcon}>
              <Text style={styles.routeIconText}>↗</Text>
            </View>
            <View style={styles.routeContent}>
              <Text style={[styles.routeTitle, { color: theme.text }]}>{route.title}</Text>
              <Text style={[styles.routeSubtitle, { color: theme.icon }]}>{route.subtitle}</Text>
              <Text style={styles.routeTime}>{route.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.operatorPanel, { backgroundColor: theme.surface }]}>
        <Text style={[styles.panelTitle, { color: theme.text }]}>Admin-ready data model</Text>
        <Text style={[styles.panelText, { color: theme.icon }]}>
          Shops, quests, reviews and check-ins already have shared TypeScript types. The next sprint
          can build the dashboard on top of the same Supabase tables.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 72,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  routeList: {
    gap: 14,
  },
  routeCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  routeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  routeContent: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  routeSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  routeTime: {
    marginTop: 10,
    color: '#FF6B35',
    fontWeight: '700',
    fontSize: 12,
  },
  operatorPanel: {
    marginTop: 24,
    marginBottom: 100,
    borderRadius: 20,
    padding: 20,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  panelText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
