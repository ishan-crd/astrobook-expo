import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  ScrollView,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Hardcoded data - no Firebase, no API
const HARDCODED_CUSTOMER = {
  customerName: 'User',
  phoneNumber: '1234567890',
  image: null,
};

const drawerData = [
  { title: 'Profile', icon: 'account' },
  { title: 'My Consultations', icon: 'calendar-check-outline' },
  { title: 'Pooja Cart', icon: 'cart' },
  { title: 'Booked Pooja', icon: 'campfire' },
  { title: 'Free Kundli', icon: 'book-open-page-variant' },
  { title: 'About Us', icon: 'account-tie' },
  { title: 'Blogs', icon: 'newspaper-variant' },
  { title: 'Contact Us', icon: 'headset' },
  { title: 'Logout', icon: 'logout' },
  { title: 'Delete Account', icon: 'delete' },
];

const DRAWER_SCREENS = {
  'Profile': 'Profile',
  'My Consultations': 'MyConsultations',
  'Pooja Cart': 'Cart',
  'Booked Pooja': 'BookedPooja',
  'Free Kundli': 'FreeKundli',
  'About Us': 'AboutUs',
  'Blogs': 'Blogs',
  'Contact Us': 'Contact',
};

export default function MyHeader() {
  const navigation = useNavigation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [customerData] = useState(HARDCODED_CUSTOMER);

  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.8)).current;

  const toggleDrawer = () => {
    if (!drawerVisible) {
      setDrawerVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDrawerVisible(false));
    }
  };

  const handleNavigation = (item) => {
    const { title } = item;
    setDrawerVisible(false);

    if (title === 'Contact Us') {
      navigation.navigate('Contact');
      return;
    }
    if (title === 'Logout') {
      Alert.alert('Logout', 'Demo app – no logout.');
      return;
    }
    if (title === 'Delete Account') {
      Alert.alert('Delete Account', 'Demo app – no delete.');
      return;
    }
    const screenName = DRAWER_SCREENS[title];
    if (screenName) {
      navigation.navigate(screenName);
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>AstroBook</Text>
        <Text style={styles.headerSubtitle}>Vedic Astrology</Text>
      </View>

      <TouchableOpacity style={styles.notificationButton}>
        <MaterialCommunityIcons name="account" size={24} color="black" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={supportModalVisible}
        animationType="fade"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Contact Information</Text>
            <View style={styles.row}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#db9a4a" />
              <View style={styles.col}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>info@acharyalavbhushan.com</Text>
              </View>
            </View>
            <View style={styles.row}>
              <MaterialCommunityIcons name="phone" size={22} color="#db9a4a" />
              <View style={styles.col}>
                <Text style={styles.label}>Consultation</Text>
                <Text style={styles.value}>+91 92579 91666</Text>
              </View>
            </View>
            <View style={styles.row}>
              <MaterialCommunityIcons name="map-marker-outline" size={24} color="#db9a4a" />
              <View style={styles.col}>
                <Text style={styles.label}>Office</Text>
                <Text style={styles.value}>
                  Plot no. 177, Jagatpura, Jaipur, Rajasthan
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setSupportModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={drawerVisible}
        animationType="fade"
        transparent
        onRequestClose={toggleDrawer}
      >
        <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={toggleDrawer}>
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.drawerHeader}>
                  <View style={styles.profileContainer}>
                    <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                      <MaterialCommunityIcons name="account" size={32} color="#fff" />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{customerData.customerName}</Text>
                      <Text style={styles.phoneText}>{customerData.phoneNumber}</Text>
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumText}>⭐ Premium User</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.menuWrapper}>
                  {drawerData.map((item) => {
                    const isDelete = item.title === 'Delete Account';
                    return (
                      <TouchableOpacity
                        key={item.title}
                        style={[styles.menuItem, isDelete && styles.deleteMenuItem]}
                        onPress={() => handleNavigation(item)}
                      >
                        <View style={styles.menuIconWrapper}>
                          <MaterialCommunityIcons
                            name={item.icon}
                            size={24}
                            color={isDelete ? '#D32F2F' : '#444'}
                          />
                        </View>
                        <Text style={[styles.menuText, isDelete && styles.deleteMenuText]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.menuArrow, isDelete && styles.deleteMenuArrow]}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.socialWrapper}>
                  <Text style={styles.socialText}>Connect With Us</Text>
                  <View style={styles.socialRow}>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.facebook.com/acharyalavbhushan09/')}
                    >
                      <MaterialCommunityIcons name="facebook" size={26} color="#9C7A56" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.instagram.com/acharyalavbhushan/')}
                    >
                      <MaterialCommunityIcons name="instagram" size={26} color="#9C7A56" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.linkedin.com/in/acharyalavbhushan/')}
                    >
                      <MaterialCommunityIcons name="linkedin" size={26} color="#9C7A56" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.youtube.com/@acharyalavbhushan')}
                    >
                      <MaterialCommunityIcons name="youtube" size={26} color="#9C7A56" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.versionText}>Version 1.0.0 (Expo Demo)</Text>
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuButton: { justifyContent: 'center', alignItems: 'center', padding: 8 },
  menuLine: {
    width: 22,
    height: 2,
    backgroundColor: '#000',
    marginVertical: 2,
    borderRadius: 1,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2C1810' },
  headerSubtitle: { fontSize: 12, color: '#9C7A56', marginTop: -2 },
  notificationButton: { padding: 8 },

  drawerHeader: {
    backgroundColor: '#db9a4a',
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomRightRadius: 24,
  },
  profileContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  headerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    backgroundColor: '#db9a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  phoneText: { fontSize: 13, color: '#FFF5E6', marginTop: 2 },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  premiumText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },

  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  drawerContainer: {
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320,
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFFFFF',
  },
  menuWrapper: { paddingTop: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  deleteMenuItem: { backgroundColor: '#FFF1F1' },
  deleteMenuText: { color: '#D32F2F', fontWeight: '600' },
  deleteMenuArrow: { color: '#D32F2F' },
  menuIconWrapper: { width: 30, alignItems: 'center', marginRight: 10 },
  menuText: { fontSize: 15, color: '#2C1810', fontWeight: '500', flex: 1 },
  menuArrow: { fontSize: 24, color: '#999', fontWeight: '300' },

  socialWrapper: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0E8DC',
  },
  socialText: { fontSize: 13, color: '#666', marginBottom: 12, fontWeight: '600' },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: { color: '#999', fontSize: 11, textAlign: 'center', marginVertical: 24 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C1810', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
  col: { flex: 1 },
  label: { fontSize: 12, color: '#9C7A56', marginBottom: 2 },
  value: { fontSize: 14, color: '#2C1810', fontWeight: '500', lineHeight: 18 },
  modalButton: {
    marginTop: 10,
    backgroundColor: '#db9a4a',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
