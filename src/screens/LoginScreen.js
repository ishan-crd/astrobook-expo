import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import api from '../config/apiConfig';
import LoadingSpinner from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const loginWithPhone = async () => {
    if (!phoneNumber || phoneNumber.length < 1) {
      Alert.alert('Warning', 'Please enter mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${api}/customers/customer-login`,
        {
          phoneNumber,
          countryCode: '91', // Default to India
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;
      if (data.success === true) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent!',
          text2: data.message || 'OTP sent successfully!',
        });
        navigation.navigate('Otp', {
          phoneNumber,
          callingCode: '91',
          newCustomer: data?.message === 'New customer added successfully',
        });
      } else {
        Alert.alert('Login Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Phone Login API Error:', error);
      Alert.alert('Error', 'Unable to login. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      Alert.alert('Warning', 'Please enter email');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('Warning', 'Please enter valid email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${api}/customers/customer-login`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;
      if (data.success === true) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent!',
          text2: data.message || 'OTP sent successfully!',
        });
        navigation.navigate('Otp', {
          email,
          newCustomer: data?.message === 'New customer added successfully',
        });
      } else {
        Alert.alert('Login Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Email Login API Error:', error);
      Alert.alert('Error', 'Unable to login. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <LoadingSpinner visible={isLoading} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.logoView}>
            <Text style={styles.loginImageText1}>AstroBook</Text>
            <Text style={styles.loginImageText}>Your Celestial Guidance App</Text>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, loginType === 'phone' && styles.toggleBtnActive]}
              onPress={() => setLoginType('phone')}
            >
              <Text style={[styles.toggleText, loginType === 'phone' && styles.toggleTextActive]}>Phone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, loginType === 'email' && styles.toggleBtnActive]}
              onPress={() => setLoginType('email')}
            >
              <Text style={[styles.toggleText, loginType === 'email' && styles.toggleTextActive]}>Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputView}>
            {loginType === 'phone' && (
              <>
                <View style={styles.phoneInputWrapper}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholder="Phone Number"
                    style={styles.phoneTextInput}
                    maxLength={10}
                  />
                </View>
                <TouchableOpacity style={styles.loginBtn} onPress={loginWithPhone} activeOpacity={0.8}>
                  <Text style={styles.loginText}>GET OTP</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {loginType === 'email' && (
              <>
                <View style={styles.phoneInputWrapper}>
                  <MaterialCommunityIcons name="mail-outline" size={20} color="#444" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter Email"
                    style={styles.phoneTextInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity style={styles.loginBtn} onPress={loginWithEmail} activeOpacity={0.8}>
                  <Text style={styles.loginText}>GET EMAIL OTP</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            <Text style={styles.loginSignupText}>
              By signing up, you agree to our{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('TermsConditions')}>
                Terms of Use
              </Text>{' '}
              and{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('PrivacyPolicy')}>
                Privacy Policy
              </Text>
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>50K+</Text>
                <Text style={styles.statLabel}>Consultations</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>100%</Text>
                <Text style={styles.statLabel}>Privacy</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>15+</Text>
                <Text style={styles.statLabel}>Years of Exp.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 30 },
  logoView: {
    alignItems: 'center',
    backgroundColor: '#db9a4a',
    paddingTop: 40,
    paddingBottom: 20,
  },
  loginImageText1: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  loginImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#F8F4EF',
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#db9a4a',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  inputView: { paddingHorizontal: 16, marginTop: 25 },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  countryCode: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'android' ? 0 : 6,
  },
  loginBtn: {
    backgroundColor: '#db9a4a',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 24,
    minHeight: 48,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginSignupText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: '#000',
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#db9a4a',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#db9a4a',
  },
  statLabel: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
  },
  separator: {
    width: 1,
    height: '60%',
    backgroundColor: '#e5caa0',
  },
});
