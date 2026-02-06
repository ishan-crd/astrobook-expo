import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api from '../config/apiConfig';
import { getExpoPushToken, getDeviceId } from '../utils/notifications';
import LoadingSpinner from '../components/LoadingSpinner';

const CELL_COUNT = 4;

export default function OtpScreen({ navigation, route }) {
  const { phoneNumber, callingCode, newCustomer, email } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [counter, setCounter] = useState(59);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const verifyOtpWithValue = async (otpValue) => {
    // Validate the OTP value passed directly
    if (!otpValue || otpValue.length !== 4) {
      Alert.alert('Warning', 'Please enter the 4-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const pushToken = await getExpoPushToken();
      const device_id = await getDeviceId();

      let payload = {};
      if (phoneNumber) {
        payload = {
          phoneNumber,
          fcmToken: pushToken || 'expo-token',
          device_id,
          otp: otpValue,
        };
      } else if (email) {
        payload = {
          email,
          fcmToken: pushToken || 'expo-token',
          device_id,
          otp: otpValue,
        };
      }

      const response = await axios.post(`${api}/customers/verify-customer`, payload);
      const res = response.data;

      if (res.success) {
        await AsyncStorage.setItem('customerData', JSON.stringify(res.customer));
        await AsyncStorage.setItem('isLoggedIn', 'true');

        Toast.show({
          type: 'success',
          text1: 'OTP Verified!',
          text2: res.message || 'Login successful',
        });

        const customer = res?.customer;
        const phone = customer?.phoneNumber?.trim();
        const customerName = customer?.customerName?.trim();
        const gender = customer?.gender?.trim();
        const dateOfBirth = customer?.dateOfBirth?.trim();
        const timeOfBirth = customer?.timeOfBirth?.trim();
        const birthPlace = customer?.address?.birthPlace?.trim();

        const isPhoneMissing = !phone;
        const iscustomerName = !customerName;
        const isgender = !gender;
        const isdateOfBirth = !dateOfBirth;
        const istimeOfBirth = !timeOfBirth;
        const isbirthPlace = !birthPlace;

        if (isPhoneMissing) {
          navigation.replace('ContactDetails', {
            customerId: customer?._id || '',
          });
        } else if (iscustomerName && isgender && isdateOfBirth && istimeOfBirth && isbirthPlace) {
          navigation.replace('SignUpLogin');
        } else {
          navigation.replace('Home');
        }
      } else {
        Alert.alert('Error', res.message || 'Verification failed.');
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      Alert.alert('Error', 'Unable to verify OTP. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    // Use current state value for manual verification (e.g., button press)
    if (!otp || otp.length !== 4) {
      Alert.alert('Warning', 'Please enter the 4-digit OTP.');
      return;
    }
    await verifyOtpWithValue(otp);
  };

  const resendOtp = async () => {
    setCounter(60);
    setIsLoading(true);
    try {
      const payload = phoneNumber ? { phoneNumber, countryCode: callingCode || '91' } : { email };
      const response = await axios.post(`${api}/customers/customer-login`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response.data;
      if (data.success === true) {
        Toast.show({
          type: 'success',
          text1: 'OTP Resent',
          text2: data.message || 'OTP sent successfully!',
        });
      } else {
        Alert.alert('Error', data.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingSpinner visible={isLoading} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={26} color="#db9a4a" />
            </TouchableOpacity>
            <Text style={styles.title}>Verify OTP</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.otpContainer}>
            <Text style={styles.otpText}>
              OTP Sent to{' '}
              <Text style={styles.phoneText}>
                {phoneNumber ? `+${callingCode || '91'}-${phoneNumber}` : email}
              </Text>
            </Text>

            <View style={styles.codeFieldContainer}>
              <TextInput
                style={styles.codeInput}
                value={otp}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  if (numericText.length <= CELL_COUNT) {
                    setOtp(numericText);
                    if (numericText.length === CELL_COUNT) {
                      // Use the numericText value directly instead of relying on state
                      setTimeout(() => {
                        verifyOtpWithValue(numericText);
                      }, 300);
                    }
                  }
                }}
                keyboardType="number-pad"
                maxLength={CELL_COUNT}
                autoFocus
                placeholder="0000"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.otpFooterRow}>
              {counter !== 0 ? (
                <>
                  <Text style={styles.otpText2}>Resend OTP available in </Text>
                  <Text style={styles.resendTimer}>{counter}s</Text>
                </>
              ) : (
                <TouchableOpacity onPress={resendOtp}>
                  <Text style={styles.resendText}>Resend</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  innerContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1810',
    flex: 1,
    textAlign: 'center',
  },
  otpContainer: { paddingTop: 60, paddingHorizontal: 20 },
  otpText: { fontSize: 14, textAlign: 'center', color: '#666' },
  phoneText: { color: '#2C1810', fontWeight: '600' },
  codeFieldContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  codeInput: {
    width: 200,
    height: 60,
    fontSize: 32,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#db9a4a',
    borderRadius: 12,
    backgroundColor: '#fff',
    letterSpacing: 8,
  },
  otpFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  otpText2: { fontSize: 13, color: '#666', marginRight: 3 },
  resendTimer: { color: '#db9a4a', fontWeight: '600' },
  resendText: { color: '#db9a4a', fontWeight: '600', fontSize: 15 },
});
