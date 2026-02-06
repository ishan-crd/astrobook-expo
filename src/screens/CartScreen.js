import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import api from '../config/apiConfig';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartScreen() {
  const navigation = useNavigation();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchCart = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('customerData');
      const customer = raw ? JSON.parse(raw) : null;
      if (!customer?._id) {
        if (showLoader) setLoading(false);
        return;
      }

      const res = await axios.post(`${api}/puja/get_cart`, {
        customerId: customer._id,
      });
      setCartData(res?.data?.data || null);
    } catch (error) {
      console.error('Cart fetch error:', error);
      Alert.alert('Error', 'Unable to load cart');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCart(false);
    setRefreshing(false);
  };

  const updateQuantity = async (item, type) => {
    if (cartLoading) return;
    try {
      setCartLoading(true);
      const raw = await AsyncStorage.getItem('customerData');
      const customer = raw ? JSON.parse(raw) : null;
      await axios.post(`${api}/puja/update_cart_quantity`, {
        customerId: customer._id,
        pujaId: item.pujaId._id,
        action: type === 'inc' ? 'increment' : 'decrement',
      });
      await fetchCart(false);
      Toast.show({
        type: 'success',
        text1: 'Updated',
        text2: 'Cart updated successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Quantity update failed',
      });
    } finally {
      setCartLoading(false);
    }
  };

  const handlePayment = async () => {
    // NOTE: Razorpay requires native modules and won't work in Expo Go
    // For production, you'll need to use EAS Build or eject from Expo
    // This is a placeholder implementation
    
    Alert.alert(
      'Payment Integration',
      'Razorpay requires native modules and needs EAS Build for production. For now, payment is simulated.',
      [
        {
          text: 'Simulate Payment',
          onPress: async () => {
            try {
              setPaymentLoading(true);
              const raw = await AsyncStorage.getItem('customerData');
              const customer = raw ? JSON.parse(raw) : null;
              
              // Create order
              const orderRes = await axios.post(`${api}/customers/create_razorpay_order`, {
                amount: cartData.totalCartPrice,
              });

              // In a real app with Razorpay native module:
              // const payment = await RazorpayCheckout.open({
              //   name: 'Acharya Lav Bhushan',
              //   description: 'Pooja Booking',
              //   currency: 'INR',
              //   key: orderRes.data.key_id,
              //   amount: Number(cartData.totalCartPrice) * 100,
              //   order_id: orderRes.data.data.id,
              //   prefill: {
              //     name: customer?.customerName || 'User',
              //     contact: customer?.phoneNumber || '',
              //     email: customer?.email || '',
              //   },
              // });

              // Simulate payment success
              await axios.post(`${api}/puja/book_puja`, {
                customerId: customer._id,
                cartId: cartData.cartId,
                razorpayOrderId: orderRes.data.data.id,
                razorpayPaymentId: 'simulated_payment_id_' + Date.now(),
              });

              Toast.show({
                type: 'success',
                text1: 'Payment Successful',
                text2: 'Pooja booked successfully',
              });

              // Clear cart and navigate
              setCartData(null);
              // navigation.navigate('BookedPooja');
            } catch (error) {
              console.error('Payment error:', error);
              Toast.show({
                type: 'error',
                text1: 'Payment Failed',
                text2: error.response?.data?.message || 'Payment failed',
              });
            } finally {
              setPaymentLoading(false);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#db9a4a" />
        </View>
      </SafeAreaView>
    );
  }

  if (!cartData || cartData.cartItems?.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <MaterialCommunityIcons name="cart-outline" size={70} color="#db9a4a" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add pooja services from the Pooja section to see them here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LoadingSpinner visible={paymentLoading} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#db9a4a']} />
        }
      >
        {cartData?.cartItems && cartData.cartItems.length > 0 ? (
          cartData.cartItems.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.poojaName}>{item?.pujaId?.pujaName || 'Pooja'}</Text>
              <Text style={styles.text}>
                Date:{' '}
                <Text style={styles.bold}>
                  {item?.pujaDate ? new Date(item.pujaDate).toDateString() : 'N/A'}
                </Text>
              </Text>
              <Text style={styles.text}>
                Price:{' '}
                <Text style={styles.bold}>₹ {item?.pujaId?.price}</Text>
              </Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => updateQuantity(item, 'dec')} style={styles.qtyBtn} disabled={cartLoading}>
                  <MaterialCommunityIcons name="minus" size={18} />
                </TouchableOpacity>
                <Text style={styles.qty}>{item?.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item, 'inc')} style={styles.qtyBtn} disabled={cartLoading}>
                  <MaterialCommunityIcons name="plus" size={18} />
                </TouchableOpacity>
              </View>
              <Text style={styles.amount}>₹ {item?.totalPujaPrice}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cart" size={60} color="#db9a4a" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Your Cart is Empty</Text>
          </View>
        )}
      </ScrollView>

      {cartData?.totalCartPrice && (
        <View style={styles.footer}>
          <Text style={styles.total}>Total: ₹ {cartData.totalCartPrice}</Text>
          <TouchableOpacity
            style={styles.payBtn}
            onPress={handlePayment}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payText}>Proceed to Pay</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#2C1810', marginTop: 16, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
  },
  poojaName: { fontSize: 16, fontWeight: '700', color: '#2C1810' },
  text: { marginTop: 4, fontSize: 14, color: '#555' },
  bold: { fontWeight: '600', color: '#333' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  qtyBtn: { backgroundColor: '#eee', padding: 6, borderRadius: 6 },
  qty: { marginHorizontal: 14, fontSize: 15, fontWeight: '600' },
  amount: { marginTop: 10, fontSize: 15, fontWeight: '700', color: '#db9a4a' },
  footer: {
    backgroundColor: '#fff',
    padding: 14,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  total: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  payBtn: {
    backgroundColor: '#db9a4a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  payText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 280 },
});
