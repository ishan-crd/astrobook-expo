import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../config/apiConfig';

const BASE_URL = 'https://alb-web-assets.s3.ap-south-1.amazonaws.com/acharyalavbhushan';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

export default function BookedPoojaScreen() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookedPoojas = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('customerData');
      const customer = raw ? JSON.parse(raw) : null;
      if (!customer?._id) {
        if (showLoader) setLoading(false);
        return;
      }

      const res = await axios.post(`${api}/puja/get_customer_booked_puja`, {
        customerId: customer._id,
      });

      if (res?.data?.success) {
        setOrders(res.data.data || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching booked poojas:', error);
      setOrders([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedPoojas();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookedPoojas(false);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#db9a4a" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="campfire" size={70} color="#db9a4a" />
          <Text style={styles.emptyText}>No Pooja Booked yet</Text>
          <Text style={styles.emptySubtext}>Your booked pujas will appear here.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#db9a4a']} tintColor="#db9a4a" />
          }
        >
          {orders.map((item, index) => {
            const puja = item?.pujaData?.[0];
            const pujaInfo = puja?.pujaId;
            return (
              <View key={index} style={styles.card}>
                <Image
                  source={{
                    uri: getImageUrl(item?.pujaImage?.[0] || pujaInfo?.image?.[0]),
                  }}
                  style={styles.image}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.poojaName}>{pujaInfo?.pujaName || 'Pooja'}</Text>
                  <Text style={styles.text}>
                    Date:{' '}
                    <Text style={styles.bold}>
                      {item?.pujaDate ? new Date(item.pujaDate).toDateString() : 'N/A'}
                    </Text>
                  </Text>
                  <Text style={styles.text}>
                    Quantity: <Text style={styles.bold}>{item.quantity}</Text>
                  </Text>
                  <Text style={styles.text}>
                    Amount:{' '}
                    <Text style={styles.amount}>₹{item.price}</Text>
                  </Text>
                  <Text style={styles.status}>
                    Status: {puja?.status ? puja.status.charAt(0).toUpperCase() + puja.status.slice(1) : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4EF',
    padding: 15,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#2C1810', marginTop: 16, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  poojaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#db9a4a',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    marginTop: 4,
  },
});
