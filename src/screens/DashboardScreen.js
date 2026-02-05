import React, { useRef, useState, useMemo, useEffect } from 'react';
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
import MyHeader from '../components/MyHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.65;
const SPACING = 16;
const TOTAL_ITEM_WIDTH = ITEM_WIDTH + SPACING;

// Hardcoded data - no Firebase, no API
const HARDCODED_CUSTOMER = { customerName: 'User', phoneNumber: '1234567890', image: null };

const HARDCODED_REVIEWS = [
  { _id: '1', name: 'Priya S.', review: 'Very accurate predictions. The astrologer was patient and helpful.', rating: 5 },
  { _id: '2', name: 'Rahul M.', review: 'Great experience. Will definitely consult again for important decisions.', rating: 5 },
  { _id: '3', name: 'Anita K.', review: 'Professional and insightful. Highly recommend AstroBook!', rating: 5 },
];

const HARDCODED_CELEB_EXP = [
  { _id: '1', name: 'Acharya Lav Bhushan', title: 'Celebrity Astrologer', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop' },
  { _id: '2', name: 'Expert Panel', title: 'Years of Experience', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
  { _id: '3', name: 'Vedic Wisdom', title: 'Trusted by Many', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop' },
];

const HARDCODED_ASTROLOGERS = [
  { _id: '1', astrologerName: 'Acharya Lav Bhushan', experience: 15, title: 'Celebrity', profileImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop', _type: 'celebrity' },
  { _id: '2', astrologerName: 'Dr. Sharma', experience: 12, title: 'Top Astrologer', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', _type: 'top' },
  { _id: '3', astrologerName: 'Pandit Ji', experience: 20, title: 'Celebrity', profileImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop', _type: 'celebrity' },
];

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

function showDemo(msg) {
  Alert.alert('Demo', msg || 'This screen is not implemented in the Expo demo.');
}

export default function DashboardScreen() {
  const [customerData] = useState(HARDCODED_CUSTOMER);
  const [reviews] = useState(HARDCODED_REVIEWS);
  const [celebExp] = useState(HARDCODED_CELEB_EXP);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingConsultations] = useState([]);
  const [combinedAstrologers] = useState(HARDCODED_ASTROLOGERS);

  const celebListRef = useRef(null);
  const flatListRef = useRef(null);
  const bannerRef = useRef(null);
  const currentIndex = useRef(0);
  const bannerIndex = useRef(0);

  const celebData = useMemo(() => (celebExp.length > 0 ? [...celebExp, ...celebExp] : []), [celebExp]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

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
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitial}>{item.name?.charAt(0) || 'U'}</Text>
        </View>
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
            <TouchableOpacity style={styles.bannerButton} onPress={() => showDemo('Consult Now – demo')}>
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
              <TouchableOpacity onPress={() => showDemo('My Consultations')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="crystal-ball" size={60} color="#db9a4a" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No Upcoming Consultations</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Astrologers</Text>
            <TouchableOpacity onPress={() => showDemo('View all astrologers')}>
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
                <Image source={{ uri: item.profileImage }} style={styles.celebrityImage} />
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
                <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => showDemo('View astrologer details')}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <View style={[styles.section, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => showDemo('Voice Call')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <MaterialCommunityIcons name="phone-in-talk" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Voice Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => showDemo('Video Call')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <MaterialCommunityIcons name="video-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Video Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => showDemo('Chat')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <MaterialCommunityIcons name="chat-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => showDemo('Book Pooja')}>
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
            <TouchableOpacity style={styles.serviceCardEnhanced} onPress={() => showDemo('Daily Horoscope')}>
              <View style={styles.serviceIconContainer}>
                <MaterialCommunityIcons name="crystal-ball" size={28} color="#db9a4a" />
              </View>
              <Text style={styles.serviceTitle}>Daily Horoscope</Text>
              <Text style={styles.serviceDescription}>Your daily predictions</Text>
              <View style={styles.serviceBadge}><Text style={styles.serviceBadgeText}>FREE</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardEnhanced} onPress={() => showDemo('Kundli Matching')}>
              <View style={styles.serviceIconContainer}>
                <MaterialCommunityIcons name="heart-outline" size={28} color="#db9a4a" />
              </View>
              <Text style={styles.serviceTitle}>Kundli Matching</Text>
              <Text style={styles.serviceDescription}>Marriage compatibility</Text>
              <View style={styles.serviceBadge}><Text style={styles.serviceBadgeText}>FREE</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardEnhanced} onPress={() => showDemo('Free Kundli')}>
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
          <TouchableOpacity style={styles.specialCard} onPress={() => showDemo('Book a Pooja')}>
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
});
