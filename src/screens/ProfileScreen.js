import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../config/apiConfig';
import * as ImagePicker from 'expo-image-picker';

const BASE_URL = 'https://alb-web-assets.s3.ap-south-1.amazonaws.com/';
const getImageUrl = (path) => (path?.startsWith('http') ? path : `${BASE_URL}${path}`);

export default function ProfileScreen() {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [customerId, setCustomerId] = useState(null);

  const loadCustomerId = async () => {
    const raw = await AsyncStorage.getItem('customerData');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data?._id) {
      setCustomerId(data._id);
    }
  };

  const fetchCustomerDetail = async () => {
    if (!customerId) return;
    try {
      setFetching(true);
      const res = await axios.post(`${api}/customers/get-customer-detail`, {
        customerId,
      });
      if (!res.data.success) return;

      const data = res.data.customersDetail;
      setCustomerName(data.customerName || '');
      setPhoneNumber(data.phoneNumber || '');
      setEmail(data.email || '');
      setGender(data.gender || '');
      if (data.dateOfBirth) {
        const dob = new Date(data.dateOfBirth);
        setDateOfBirth(dob.toISOString().split('T')[0]);
      }
      if (data.timeOfBirth) {
        const tob = new Date(data.timeOfBirth);
        setTimeOfBirth(`${String(tob.getHours()).padStart(2, '0')}:${String(tob.getMinutes()).padStart(2, '0')}`);
      }
      setPlaceOfBirth(data?.address?.birthPlace || '');

      if (data.image) {
        const imageUrl = data.image.startsWith('http') ? data.image : getImageUrl(data.image);
        setProfileImage({ uri: imageUrl });
      }
    } catch (err) {
      console.log('Customer fetch error:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadCustomerId();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail();
    }
  }, [customerId]);

  const isValidEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim());
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    if (!customerName || !gender || !dateOfBirth || !timeOfBirth || !placeOfBirth || !phoneNumber) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (email && !isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const [firstName, ...rest] = customerName.trim().split(' ');
      const lastName = rest.join(' ');

      const formatDateTime = (dateStr, timeStr) => {
        const [h, m] = timeStr.split(':');
        return `${dateStr}T${h}:${m}:00`;
      };

      const formattedDateTime = formatDateTime(dateOfBirth, timeOfBirth);

      const payload = {
        customerId,
        firstName,
        lastName,
        email: email?.trim() || undefined,
        gender,
        dateOfBirth: formattedDateTime,
        timeOfBirth: formattedDateTime,
        placeOfBirth,
        latitude: 0,
        longitude: 0,
      };

      const res = await axios.post(`${api}/customers/update_profile_intake`, payload);

      if (res.data.success) {
        let updatedProfile = res.data.results;

        if (profileImage?.uri && !profileImage.uri.startsWith('http')) {
          // Image upload would go here - requires FormData
          // For now, just update the profile data
          Alert.alert('Note', 'Profile updated. Image upload requires additional setup.');
        }

        await AsyncStorage.setItem('customerData', JSON.stringify(updatedProfile));
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', res.data.message || 'Update failed');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#db9a4a" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {profileImage?.uri ? (
                <Image source={{ uri: profileImage.uri }} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={110} color="#db9a4a" />
              )}
              {isEditing && (
                <TouchableOpacity style={styles.cameraIcon} onPress={pickImage} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="account" size={20} color="#db9a4a" />
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              style={styles.textInput}
              editable={isEditing}
              placeholder="Full name"
            />
          </View>

          <Text style={styles.label}>Mobile Number *</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="phone" size={20} color="#db9a4a" />
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.textInput}
              keyboardType="phone-pad"
              maxLength={10}
              editable={isEditing}
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#db9a4a" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
              keyboardType="email-address"
              editable={isEditing}
            />
          </View>

          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'Male' && styles.genderBtnActive]}
              onPress={() => isEditing && setGender('Male')}
            >
              <Text style={[styles.genderText, gender === 'Male' && styles.genderTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'Female' && styles.genderBtnActive]}
              onPress={() => isEditing && setGender('Female')}
            >
              <Text style={[styles.genderText, gender === 'Female' && styles.genderTextActive]}>Female</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Date of Birth * (YYYY-MM-DD)</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="calendar" size={20} color="#db9a4a" />
            <TextInput
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              style={styles.textInput}
              editable={isEditing}
              placeholder="1990-01-15"
            />
          </View>

          <Text style={styles.label}>Time of Birth * (HH:MM)</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#db9a4a" />
            <TextInput
              value={timeOfBirth}
              onChangeText={setTimeOfBirth}
              style={styles.textInput}
              editable={isEditing}
              placeholder="10:30"
            />
          </View>

          <Text style={styles.label}>Place of Birth *</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#db9a4a" />
            <TextInput
              value={placeOfBirth}
              onChangeText={setPlaceOfBirth}
              style={styles.textInput}
              editable={isEditing}
              placeholder="City, Country"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, isEditing ? styles.saveBtn : styles.editBtn]}
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>{isEditing ? 'Save' : 'Edit Profile'}</Text>
              )}
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#db9a4a',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#2C1810', marginBottom: 8, marginTop: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  textInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#2C1810', paddingVertical: 0 },
  genderRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8DCC8',
    alignItems: 'center',
  },
  genderBtnActive: { backgroundColor: '#db9a4a', borderColor: '#db9a4a' },
  genderText: { fontSize: 15, fontWeight: '600', color: '#666' },
  genderTextActive: { color: '#fff' },
  buttonRow: { marginTop: 28, gap: 12 },
  primaryBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  editBtn: { backgroundColor: '#db9a4a' },
  saveBtn: { backgroundColor: '#16A34A' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontSize: 15 },
});
