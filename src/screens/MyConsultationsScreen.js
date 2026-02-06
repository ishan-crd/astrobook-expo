import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../config/apiConfig';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'pending', label: 'Expired' },
  { key: 'completed', label: 'Completed' },
];

const getStartDateTime = (item) => {
  if (!item?.date || !item?.fromTime) return new Date(8640000000000000);
  const dateObj = new Date(item.date);
  const [h, m] = item.fromTime.split(':').map(Number);
  dateObj.setHours(h, m, 0, 0);
  return dateObj;
};

const parseTimeToDate = (date, fromTime, toTime) => {
  const dateObj = new Date(date);
  const [sh, sm] = fromTime.split(':').map(Number);
  const [eh, em] = toTime.split(':').map(Number);
  const startDate = new Date(dateObj);
  startDate.setHours(sh, sm, 0, 0);
  const endDate = new Date(dateObj);
  endDate.setHours(eh, em, 0, 0);
  return { startDate, endDate };
};

export default function MyConsultationsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getConsultations = async () => {
    setIsLoading(true);
    try {
      const rawCustomerData = await AsyncStorage.getItem('customerData');
      if (!rawCustomerData) {
        setIsLoading(false);
        return;
      }
      const customerData = JSON.parse(rawCustomerData);

      const response = await axios.get(
        `${api}/mobile/user-consultations/${customerData?._id}`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response?.data?.success) {
        setConsultations(response?.data?.bookings || []);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getConsultations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getConsultations();
    setRefreshing(false);
  };

  const searchFiltered = consultations.filter((item) =>
    item?.astrologer?.name?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = searchFiltered
    .filter((item) => {
      if (item?.status !== 'booked') return false;
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      const todayOnly = new Date();
      todayOnly.setHours(0, 0, 0, 0);
      const { endDate } = parseTimeToDate(item.date, item.fromTime, item.toTime);
      if (itemDate > todayOnly) return true;
      if (itemDate.getTime() === todayOnly.getTime()) return now <= endDate;
      return false;
    })
    .sort((a, b) => getStartDateTime(a) - getStartDateTime(b));

  const pending = searchFiltered
    .filter((item) => {
      if (item?.status !== 'booked') return false;
      const { endDate } = parseTimeToDate(item.date, item.fromTime, item.toTime);
      return now > endDate;
    })
    .sort((a, b) => getStartDateTime(a) - getStartDateTime(b));

  const completed = searchFiltered
    .filter((item) => item?.status === 'completed' || item?.status === 'user_not_joined')
    .sort((a, b) => getStartDateTime(a) - getStartDateTime(b));

  let currentList = [];
  if (activeTab === 'upcoming') currentList = upcoming;
  else if (activeTab === 'pending') currentList = pending;
  else currentList = completed;

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
        {isLoading ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="crystal-ball" size={60} color="#db9a4a" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : currentList.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="crystal-ball" size={60} color="#db9a4a" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No Consultations</Text>
            <Text style={styles.emptySubtext}>Your {activeTab} consultations will appear here.</Text>
          </View>
        ) : (
          currentList.map((item, index) => {
            const astrologerName = item?.astrologer?.name || 'Astrologer';
            const experience = item?.astrologer?.experience || 'N/A';
            const rating = item?.astrologer?.rating || 0;
            const price = item?.consultationPrice;
            const mode =
              item?.consultationType === 'videocall'
                ? 'Video Call'
                : item?.consultationType === 'call'
                  ? 'Voice Call'
                  : 'Chat';
            const timeObj = `${item?.fromTime} - ${item?.toTime}`;
            const dateObj = new Date(item?.date);
            const formattedDate = dateObj?.toDateString();

            return (
              <View key={index} style={styles.card}>
                <Text style={styles.astrologerName}>{astrologerName}</Text>
                <View style={styles.modeBadge}>
                  <MaterialCommunityIcons
                    name={
                      item?.consultationType === 'videocall'
                        ? 'video-outline'
                        : item?.consultationType === 'call'
                          ? 'phone'
                          : 'chat-outline'
                    }
                    size={16}
                    color="#db9a4a"
                  />
                  <Text style={styles.modeText}>{mode}</Text>
                </View>
                <Text style={styles.details}>Experience: {experience} yrs</Text>
                {rating !== 0 && <Text style={styles.details}>Rating: ⭐ {rating}</Text>}
                <Text style={styles.details}>Date: {formattedDate}</Text>
                <Text style={styles.details}>Time: {timeObj}</Text>
                <Text style={styles.price}>₹ {price}</Text>
                {activeTab === 'completed' && (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.status === 'completed' ? '#16A34A' : '#DC2626',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.status === 'completed' ? 'check-circle-outline' : 'close-circle-outline'}
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.statusBadgeText}>
                      {item.status === 'completed' ? 'Completed' : "Didn't Join"}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEE2D3',
  },
  astrologerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  price: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#db9a4a',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  modeText: {
    marginLeft: 6,
    color: '#db9a4a',
    fontWeight: '600',
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
