import { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
  FlatList,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../config/apiConfig';
import IMAGE_BASE_URL from '../config/imageConfig';
import MyHeader from '../components/MyHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.65;
const SPACING = 16;
const TOTAL_ITEM_WIDTH = ITEM_WIDTH + SPACING;

const getImageUrl = (path) => (path?.startsWith('http') ? path : `${IMAGE_BASE_URL}${path}`);

const BANNER_IMAGES = [
  { id: '1', image: require('../assets/banners/4.png') },
  { id: '2', image: require('../assets/banners/5.png') },
  { id: '3', image: require('../assets/banners/6.png') },
];

const YOUTUBE_VIDEOS = [
  { id: 1, url: 'https://youtu.be/gJcMN2tIVT8?si=uXBmL-MptKmILxde', title: 'Astrology & Real Life Incidents' },
  { id: 2, url: 'https://youtu.be/7k1kigASoig?si=9qv-nn6Z1yTi5kMF', title: 'Acharya Ji ne khola crorepati banne ka asli formula' },
  { id: 3, url: 'https://youtu.be/s0TrbB1_qQU?si=P1Sx8mdtEnw_h-5j', title: 'Why GenZ is Depressed & Struggling' },
];

function getYouTubeThumbnail(url) {
  let videoId = null;
  if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
  else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Removed showDemo - using real navigation now

export default function DashboardScreen({ navigation }) {
  const [customerData, setCustomerData] = useState({
    customerName: 'User',
    phoneNumber: '1234567890',
    image: null,
  });
  const [reviews, setReviews] = useState([]);
  const [celebExp, setCelebExp] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingConsultations, setUpcomingConsultations] = useState([]);
  const [celebrityAstrologers, setCelebrityAstrologers] = useState([]);
  const [topAstrologers, setTopAstrologers] = useState([]);

  const celebListRef = useRef(null);
  const flatListRef = useRef(null);
  const bannerRef = useRef(null);
  const currentIndex = useRef(0);
  const bannerIndex = useRef(0);

  const celebData = useMemo(() => (celebExp.length > 0 ? [...celebExp, ...celebExp] : []), [celebExp]);

  const combinedAstrologers = useMemo(() => {
    const celebrity = celebrityAstrologers.map(item => ({
      ...item,
      _type: 'celebrity',
    }));
    const top = topAstrologers.map(item => ({
      ...item,
      _type: 'top',
    }));
    return [...celebrity, ...top];
  }, [celebrityAstrologers, topAstrologers]);

  // API Fetch Functions
  const fetchCustomer = async () => {
    try {
      const storedData = await AsyncStorage.getItem('customerData');
      if (storedData) {
        setCustomerData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error reading customerData:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${api}/customers/get-feedback`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response?.data?.success) {
        setReviews(response?.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchCelebrityExp = async () => {
    try {
      const response = await axios.get(`${api}/admin/get_celebrity_experience`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response?.data?.success) {
        setCelebExp(response?.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching celebrity experience:', error);
    }
  };

  const fetchCelebrityAstrologers = async () => {
    try {
      const currentTime = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const res = await axios.get(
        `${api}/astrologer/astrologer_filters?limit=50&hasAvailableSlots=true&currentTime=${currentTime}`
      );
      if (res?.data?.success) {
        const allAstrologers = res.data.results || [];
        const celebrityOnly = allAstrologers.filter(astro => astro?.title === 'Celebrity');
        const topAstrologersOnly = allAstrologers.filter(astro => astro?.title === 'Top Astrologer');
        setCelebrityAstrologers(celebrityOnly);
        setTopAstrologers(topAstrologersOnly);
      }
    } catch (err) {
      console.log('Celebrity astrologer error:', err);
    }
  };

  const toDateFromTime = (dateObj, timeStr) => {
    if (!dateObj || !timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(dateObj);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const fetchUpcomingConsultations = async () => {
    try {
      const raw = await AsyncStorage.getItem('customerData');
      const customerData = raw ? JSON.parse(raw) : null;
      if (!customerData?._id) return;

      const res = await axios.get(`${api}/mobile/user-consultations/${customerData._id}`);

      if (!res?.data?.success) return;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const upcoming = res.data.bookings
        .filter(b => b.status === 'booked')
        .filter(b => b.date && b.fromTime && b.toTime)
        .filter(b => {
          const bookingDate = new Date(b.date);
          const bookingDay = new Date(
            bookingDate.getFullYear(),
            bookingDate.getMonth(),
            bookingDate.getDate()
          );
          if (bookingDay < todayStart) return false;
          const endTime = toDateFromTime(bookingDate, b.toTime);
          return endTime && endTime > now;
        })
        .sort((a, b) => {
          const aStart = toDateFromTime(new Date(a.date), a.fromTime);
          const bStart = toDateFromTime(new Date(b.date), b.fromTime);
          return aStart - bStart;
        })
        .slice(0, 3);

      setUpcomingConsultations(upcoming);
    } catch (err) {
      console.log('Upcoming Fetch Error:', err);
    }
  };

  const fetchAstrologerDetails = async (id, mode = 'video') => {
    try {
      const response = await axios.post(
        `${api}/astrologer/get-astrologer-details`,
        { astrologerId: id },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response?.data?.success) {
        if (navigation?.navigate) {
          // navigation.navigate('AstrologerDetailsScreen', {
          //   astrologer: response.data.astrologer,
          //   mode,
          // });
          Alert.alert('Astrologer Details', `Viewing details for astrologer ID: ${id}`);
        }
      } else {
        Alert.alert('No Data', 'Astrologer details not found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch astrologer details.');
    }
  };

  useEffect(() => {
    fetchCustomer();
    fetchReviews();
    fetchCelebrityExp();
    fetchCelebrityAstrologers();
    fetchUpcomingConsultations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCustomer(),
      fetchReviews(),
      fetchCelebrityExp(),
      fetchCelebrityAstrologers(),
      fetchUpcomingConsultations(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (celebExp.length === 0) return;
    let offset = 0;
    const interval = setInterval(() => {
      offset += 3;
      celebListRef.current?.scrollToOffset({ offset, animated: false });
      if (offset >= celebExp.length * TOTAL_ITEM_WIDTH) {
        offset = 0;
        celebListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }
    }, 16);
    return () => clearInterval(interval);
  }, [celebExp]);

  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % reviews.length;
      flatListRef.current?.scrollToIndex({ index: currentIndex.current, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [reviews]);

  useEffect(() => {
    const interval = setInterval(() => {
      bannerIndex.current = (bannerIndex.current + 1) % BANNER_IMAGES.length;
      bannerRef.current?.scrollToIndex({ index: bannerIndex.current, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderCelebItem = ({ item }) => (
    <View style={styles.celebCard}>
      <Image source={{ uri: item.image }} style={styles.celebImage} />
      <View style={styles.celebOverlay}>
        <Text style={styles.celebName}>{item.name}</Text>
        <Text style={styles.celebTitle}>{item.title}</Text>
      </View>
    </View>
  );

  const renderReviewItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.reviewText}>{item.review}</Text>
      <View style={styles.footer}>
        {item.image ? (
          <Image source={{ uri: getImageUrl(item.image) }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{item.name?.charAt(0) || 'U'}</Text>
          </View>
        )}
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.rating}>{'⭐'.repeat(item.rating || 5)}</Text>
        </View>
      </View>
    </View>
  );

  const renderBanner = ({ item }) => (
    <TouchableOpacity style={styles.bannerSlide}>
      <Image source={item.image} style={styles.bannerImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
        <MyHeader />
      </SafeAreaView>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#db9a4a']} tintColor="#db9a4a" />
        }
      >
        <View style={styles.heroBanner}>
          <View style={styles.bannerGradient}>
            <Text style={styles.bannerTitle}>Hi {customerData?.customerName || 'User'}</Text>
            <Text style={styles.bannerTitle}>Talk to India's Best</Text>
            <Text style={styles.bannerTitleHighlight}>Astrologers</Text>
            <Text style={styles.bannerSubtitle}>Get accurate predictions & personalized remedies</Text>
            <TouchableOpacity style={styles.bannerButton} onPress={() => navigation?.navigate && navigation.navigate('Home')}>
              <Text style={styles.bannerButtonText}>Consult Now</Text>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#db9a4a" />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerDecoration}>
            <Text style={styles.bannerEmoji}>✨</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>15+</Text>
            <Text style={styles.statLabel}>Years of Experience</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Privacy</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
            {upcomingConsultations.length > 0 && (
              <TouchableOpacity onPress={() => navigation?.navigate && navigation.navigate('MyConsultations')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {upcomingConsultations.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="crystal-ball" size={60} color="#db9a4a" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No Upcoming Consultations</Text>
            </View>
          ) : (
            upcomingConsultations.map((item, index) => {
              const astrologer = item.astrologer || {};
              const startStr = item.fromTime;
              const endStr = item.toTime;
              const now = new Date();
              const bookingDate = new Date(item.date || now.toISOString());
              const start = startStr ? toDateFromTime(bookingDate, startStr) : null;
              const end = endStr ? toDateFromTime(bookingDate, endStr) : null;
              const isJoinTime = start && end && now >= start && now <= end;

              const getModeIcon = (mode) => {
                switch (mode?.toLowerCase()) {
                  case 'call': return 'phone';
                  case 'videocall': return 'video-outline';
                  case 'chat': return 'chat-outline';
                  default: return 'help-circle-outline';
                }
              };

              const getDurationInMinutes = (fromTime, toTime) => {
                if (!fromTime || !toTime) return 0;
                const [fromH, fromM] = fromTime.split(':').map(Number);
                const [toH, toM] = toTime.split(':').map(Number);
                const fromTotal = fromH * 60 + fromM;
                const toTotal = toH * 60 + toM;
                return toTotal - fromTotal;
              };

              return (
                <View key={index} style={styles.consultationCard}>
                  <View style={styles.consultationAvatar}>
                    <Text style={styles.consultationAvatarText}>
                      {astrologer?.name?.charAt(0) || 'A'}
                    </Text>
                  </View>
                  <View style={styles.consultationInfo}>
                    <Text style={styles.consultationName}>
                      {astrologer?.name || 'Unknown'}
                    </Text>
                    <View style={styles.consultationTime}>
                      <MaterialCommunityIcons
                        name={getModeIcon(item.consultationType)}
                        size={16}
                        color="#7F1D1D"
                      />
                      <Text style={styles.consultationTopic}> | </Text>
                      <Text style={styles.consultationTopic}>
                        {getDurationInMinutes(item.fromTime, item.toTime)} min
                      </Text>
                    </View>
                    <View style={styles.consultationTime}>
                      <MaterialCommunityIcons name="calendar" size={12} color="#999" />
                      <Text style={styles.consultationTimeText}>
                        {bookingDate.toDateString()}
                      </Text>
                    </View>
                  </View>
                  {(isJoinTime && item.consultationType === 'chat') ? (
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={() => Alert.alert('Info', 'Join chat feature coming soon')}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.timeButton}>
                      <Text style={styles.timeButtonText}>{startStr || '-'}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Astrologers</Text>
            <TouchableOpacity onPress={() => Alert.alert('Info', 'Astrologer list screen coming soon')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={combinedAstrologers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.celebrityCard}>
                  <Image source={{ uri: getImageUrl(item.profileImage) }} style={styles.celebrityImage} />
                {item._type === 'celebrity' && (
                  <View style={styles.celebrityBadge}>
                    <Text style={styles.celebrityBadgeText}>Celebrity Astrologer</Text>
                  </View>
                )}
                {item._type === 'top' && (
                  <View style={[styles.celebrityBadge, { backgroundColor: '#edc967' }]}>
                    <Text style={styles.celebrityBadgeText}>Top Astrologer</Text>
                  </View>
                )}
                  <Text style={styles.celebrityName}>{item?.astrologerName}</Text>
                  <Text style={styles.celebrityExp}>{item?.experience}+ yrs experience</Text>
                  <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => fetchAstrologerDetails(item?._id, 'video')}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <View style={[styles.section, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Info', 'Voice Call feature coming soon')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <MaterialCommunityIcons name="phone-in-talk" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Voice Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Info', 'Video Call feature coming soon')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <MaterialCommunityIcons name="video-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Video Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Info', 'Chat feature coming soon')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <MaterialCommunityIcons name="chat-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Info', 'Pooja booking coming soon')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <MaterialCommunityIcons name="campfire" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Book Pooja</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bannerWrapper}>
          <FlatList
            ref={bannerRef}
            data={BANNER_IMAGES}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            snapToInterval={SCREEN_WIDTH - 20}
            decelerationRate="fast"
            disableIntervalMomentum
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Free Services</Text>
              <Text style={styles.sectionSubtitle}>Explore our complimentary offerings</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
            <TouchableOpacity style={styles.serviceCardEnhanced} onPress={() => Alert.alert('Info', 'Daily Horoscope coming soon')}>
              <View style={styles.serviceIconContainer}>
                <MaterialCommunityIcons name="crystal-ball" size={28} color="#db9a4a" />
              </View>
              <Text style={styles.serviceTitle}>Daily Horoscope</Text>
              <Text style={styles.serviceDescription}>Your daily predictions</Text>
              <View style={styles.serviceBadge}><Text style={styles.serviceBadgeText}>FREE</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardEnhanced} onPress={() => Alert.alert('Info', 'Kundli Matching coming soon')}>
              <View style={styles.serviceIconContainer}>
                <MaterialCommunityIcons name="heart-outline" size={28} color="#db9a4a" />
              </View>
              <Text style={styles.serviceTitle}>Kundli Matching</Text>
              <Text style={styles.serviceDescription}>Marriage compatibility</Text>
              <View style={styles.serviceBadge}><Text style={styles.serviceBadgeText}>FREE</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardEnhanced} onPress={() => navigation?.navigate && navigation.navigate('FreeKundli')}>
              <View style={styles.serviceIconContainer}>
                <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#db9a4a" />
              </View>
              <Text style={styles.serviceTitle}>Free Kundli</Text>
              <Text style={styles.serviceDescription}>Birth chart analysis</Text>
              <View style={styles.serviceBadge}><Text style={styles.serviceBadgeText}>FREE</Text></View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Celebrity Experiences</Text>
          <Animated.FlatList
            ref={celebListRef}
            data={celebData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => item._id + index}
            renderItem={renderCelebItem}
            scrollEnabled={false}
            getItemLayout={(_, index) => ({ length: TOTAL_ITEM_WIDTH, offset: TOTAL_ITEM_WIDTH * index, index })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Offerings</Text>
          <TouchableOpacity style={styles.specialCard} onPress={() => Alert.alert('Info', 'Pooja booking coming soon')}>
            <View style={styles.specialLeft}>
              <MaterialCommunityIcons name="campfire" size={36} color="#db9a4a" />
            </View>
            <View style={styles.specialMiddle}>
              <Text style={styles.specialTitle}>Book a Pooja</Text>
              <Text style={styles.specialDescription}>Personalized rituals for prosperity</Text>
              <View style={styles.specialRating}>
                <Text style={styles.specialRatingText}>⭐ 4.9 • 2K+ bookings</Text>
              </View>
            </View>
            <View style={styles.specialRight}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#db9a4a" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.specialCard} onPress={() => Linking.openURL('https://lifechangingastro.com/')}>
            <View style={styles.specialLeft}>
              <MaterialCommunityIcons name="store" size={36} color="#db9a4a" />
            </View>
            <View style={styles.specialMiddle}>
              <Text style={styles.specialTitle}>AstroBook Store - Shop Now</Text>
              <Text style={styles.specialDescription}>Life Changing Astro</Text>
            </View>
            <View style={styles.specialRight}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#db9a4a" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Users Say</Text>
          <FlatList
            ref={flatListRef}
            data={reviews}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item._id}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Watch Our Videos</Text>
          <FlatList
            data={YOUTUBE_VIDEOS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.videoCard} onPress={() => Linking.openURL(item.url)}>
                <Image source={{ uri: getYouTubeThumbnail(item.url) }} style={styles.videoThumbnail} />
                <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  content: {},
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: { fontSize: 15, color: '#666', fontWeight: '500', textAlign: 'center' },
  celebCard: {
    width: ITEM_WIDTH,
    height: 400,
    marginRight: 16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  celebImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  celebOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  celebName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  celebTitle: { color: '#FDE68A', fontSize: 11, marginTop: 2 },
  viewAllText: { color: '#db9a4a', fontSize: 13, fontWeight: '600' },
  heroBanner: {
    backgroundColor: '#7F1D1D',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerGradient: { zIndex: 1 },
  bannerTitle: { fontSize: 24, fontWeight: '300', color: '#FFFFFF' },
  bannerTitleHighlight: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', marginTop: -4 },
  bannerSubtitle: { fontSize: 13, color: '#FFF5E6', marginTop: 8, opacity: 0.9 },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 16,
  },
  bannerButtonText: { color: '#db9a4a', fontWeight: '700', fontSize: 14, marginRight: 8 },
  bannerDecoration: { position: 'absolute', right: -10, top: -10, opacity: 0.15 },
  bannerEmoji: { fontSize: 120 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#db9a4a' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#2C1810', marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: '#666' },
  celebrityCard: {
    width: 170,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
    elevation: 3,
  },
  celebrityImage: { width: '100%', height: 140, borderRadius: 12 },
  celebrityBadge: {
    position: 'static',
    top: 10,
    left: 10,
    backgroundColor: '#7F1D1D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  celebrityBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  celebrityName: { fontSize: 15, fontWeight: '700', marginTop: 8, color: '#2C1810' },
  celebrityExp: { fontSize: 12, color: '#777', marginVertical: 4 },
  viewDetailsBtn: { marginTop: 8, backgroundColor: '#db9a4a', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  viewDetailsText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginTop: 12 },
  actionCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: { fontSize: 15, fontWeight: '600', color: '#2C1810', textAlign: 'center' },
  bannerWrapper: { marginTop: 16, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden' },
  bannerSlide: { width: SCREEN_WIDTH - 32, height: 190 },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 20 },
  servicesScroll: { paddingVertical: 4 },
  serviceCardEnhanced: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    marginLeft: 4,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: { fontSize: 14, fontWeight: '600', color: '#2C1810', marginBottom: 4 },
  serviceDescription: { fontSize: 11, color: '#666' },
  serviceBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  serviceBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  specialCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
  },
  specialLeft: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  specialMiddle: { flex: 1, paddingRight: 8 },
  specialTitle: { fontSize: 16, fontWeight: '600', color: '#2C1810', marginBottom: 4 },
  specialDescription: { fontSize: 12, color: '#666', marginBottom: 6 },
  specialRating: { flexDirection: 'row' },
  specialRatingText: { fontSize: 11, color: '#999' },
  specialRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: SCREEN_WIDTH - 64,
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    marginLeft: 4,
    marginVertical: 4,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#db9a4a',
  },
  reviewText: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 16, fontStyle: 'italic' },
  footer: { flexDirection: 'row', alignItems: 'center' },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#db9a4a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: { color: '#fff', fontSize: 18, fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '600', color: '#2C1810' },
  rating: { fontSize: 12, color: '#db9a4a', marginTop: 2 },
  videoCard: {
    width: 200,
    marginRight: 12,
    marginLeft: 4,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  videoThumbnail: { width: '100%', height: 120 },
  videoTitle: { padding: 10, fontSize: 13, fontWeight: '600', color: '#2C1810' },
  consultationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#db9a4a',
  },
  consultationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#db9a4a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  consultationAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  consultationInfo: {
    flex: 1,
  },
  consultationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C1810',
    marginBottom: 4,
  },
  consultationTopic: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    marginTop: 4,
  },
  consultationTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  consultationTimeText: {
    fontSize: 12,
    color: '#999',
  },
  joinButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timeButton: {
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#db9a4a',
  },
  timeButtonText: {
    color: '#db9a4a',
    fontSize: 13,
    fontWeight: '600',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
});
