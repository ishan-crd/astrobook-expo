import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'pending', label: 'Expired' },
  { key: 'completed', label: 'Completed' },
];

export default function MyConsultationsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Astrologer Name..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#db9a4a']} tintColor="#db9a4a" />
        }
      >
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="crystal-ball" size={60} color="#db9a4a" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No Consultations</Text>
          <Text style={styles.emptySubtext}>Your upcoming and past consultations will appear here.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F4EF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  searchInput: { flex: 1, color: '#333', fontSize: 15 },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#E8DCC8',
  },
  tabButton: { paddingVertical: 8, paddingHorizontal: 10 },
  activeTabButton: { borderBottomWidth: 3, borderColor: '#db9a4a' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#db9a4a', fontWeight: '700' },
  scrollContent: { flex: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 30 },
  emptyState: { alignItems: 'center', paddingVertical: 120 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#2C1810', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
});
