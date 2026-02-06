import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import axios from 'axios';
import Modal from 'react-native-modal';
import api from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlaceInput from '../components/PlaceInput';
import Toast from 'react-native-toast-message';
import LoadingSpinner from '../components/LoadingSpinner';
import IMAGE_BASE_URL from '../config/imageConfig';

const { width } = Dimensions.get('screen');

export default function SignUpLoginScreen({ navigation, route }) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [timeOfBirth, setTimeOfBirth] = useState(null);
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [customerId, setCustomerId] = useState(null);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [pickedImage, setPickedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpFor, setOtpFor] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCustomerId = async () => {
    const raw = await AsyncStorage.getItem('customerData');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data?._id) {
      setCustomerId(data._id);
      setPhoneNumber(data.phoneNumber || '');
      setEmail(data.email || '');
    }
  };

  useEffect(() => {
    loadCustomerId();
  }, []);

  const isValidEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim());
  };

  const sendUpdateOtp = async (type) => {
    try {
      if (type === 'email') {
        if (!email?.trim()) {
          Alert.alert('Error', 'Please enter email address');
          return;
        }
        if (!isValidEmail(email?.trim())) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
          return;
        }
      }

      setLoading(true);
      const payload = {
        customerId: customerId,
        ...(type === 'email' ? { email: email?.trim() } : { phoneNumber: phoneNumber?.trim() }),
      };

      const res = await axios.post(`${api}/customers/send-update-otp`, payload);

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: `OTP sent to your ${type}`,
        });
        setOtpFor(type);
        setOtpSent(true);
        setOtp('');
        setOtpModalVisible(true);
      } else {
        Alert.alert('Error', res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Unable to send OTP');
      setOtpModalVisible(false);
      setOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndUpdate = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        customerId: customerId,
        otp,
        ...(otpFor === 'email' ? { email } : { phoneNumber }),
      };

      const res = await axios.post(`${api}/customers/update-contact`, payload);

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Updated successfully',
        });
        setOtp('');
        setOtpSent(false);
        setOtpFor(null);
        setOtpModalVisible(false);
        setIsEditingPhone(false);
        setIsEditingEmail(false);
      } else {
        Alert.alert('Error', res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getProfilePic = useCallback(async (type, options) => {
    if (type === 'capture') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Camera permission is required');
        return;
      }
    }

    const picker = type === 'capture' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;

    const result = await picker({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      ...options,
    });

    setModalVisible(false);

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setProfileImage({ uri: asset.uri });
      setPickedImage(asset);
    }
  }, []);

  const uploadProfileImage = async (customerId, imageFile) => {
    const imgData = new FormData();
    const fileName = imageFile.fileName || `camera_${Date.now()}.jpg`;
    const fileType = imageFile.type || 'image/jpeg';

    imgData.append('customerId', customerId);
    imgData.append('image', {
      uri: Platform.OS === 'android' ? imageFile.uri : imageFile.uri.replace('file://', ''),
      name: fileName,
      type: fileType,
    });

    const res = await axios.post(`${api}/customers/change_profile`, imgData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  };

  const handleSubmit = async () => {
    if (!customerName || !gender || !dateOfBirth || !timeOfBirth || !placeOfBirth || !phoneNumber) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    if (email && !isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const [firstName, ...rest] = customerName.trim().split(' ');
      const lastName = rest.join(' ');

      const payload = {
        customerId: customerId,
        firstName,
        lastName,
        gender,
        email,
        dateOfBirth: moment(dateOfBirth).toISOString(),
        timeOfBirth: moment(timeOfBirth).toISOString(),
        placeOfBirth,
        latitude,
        longitude,
      };

      const res = await axios.post(`${api}/customers/update_profile_intake`, payload);
      if (res.data.success) {
        let updatedProfile = res.data.results;

        if (pickedImage) {
          const imgRes = await uploadProfileImage(customerId, pickedImage);
          if (imgRes?.success && imgRes?.image) {
            const fullImageUrl = `${IMAGE_BASE_URL}${imgRes.image}`;
            updatedProfile = { ...updatedProfile, image: imgRes.image };
            setProfileImage({ uri: fullImageUrl });
          }
        }

        await AsyncStorage.setItem('customerData', JSON.stringify(updatedProfile));
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.message || 'Profile Updated Successfully',
        });
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDobDisplay = (dob) => {
    if (!dob) return '';
    const date = new Date(dob);
    return date.toDateString();
  };

  const Required = () => <Text style={{ color: 'red' }}> *</Text>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'android' ? 80 : 0}>
      <LoadingSpinner visible={isLoading || loading} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            {profileImage?.uri ? (
              <Image source={{ uri: profileImage.uri }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={110} color="#B9B1A8" />
            )}
            <TouchableOpacity style={styles.cameraIcon} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>
          Full Name<Required />
        </Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="account" size={20} color="#db9a4a" />
          <TextInput value={customerName} onChangeText={setCustomerName} style={styles.textInput} />
        </View>

        <Text style={styles.label}>Phone Number<Required /></Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="phone" size={20} color="#db9a4a" />
          <TextInput value={phoneNumber} onChangeText={setPhoneNumber} style={styles.textInput} keyboardType="phone-pad" editable={!isEditingPhone} />
          {!isEditingPhone && (
            <TouchableOpacity onPress={() => setIsEditingPhone(true)} style={styles.inlineOtpButton}>
              <Text style={styles.inlineOtpText}>Edit</Text>
            </TouchableOpacity>
          )}
          {isEditingPhone && (
            <TouchableOpacity onPress={() => sendUpdateOtp('phone')} style={styles.inlineOtpButton}>
              <Text style={styles.inlineOtpText}>Send OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#db9a4a" />
          <TextInput value={email} onChangeText={setEmail} style={styles.textInput} keyboardType="email-address" autoCapitalize="none" editable={!isEditingEmail} />
          {!isEditingEmail && email && (
            <TouchableOpacity onPress={() => setIsEditingEmail(true)} style={styles.inlineOtpButton}>
              <Text style={styles.inlineOtpText}>Edit</Text>
            </TouchableOpacity>
          )}
          {isEditingEmail && (
            <TouchableOpacity onPress={() => sendUpdateOtp('email')} style={styles.inlineOtpButton}>
              <Text style={styles.inlineOtpText}>Send OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal isVisible={otpModalVisible} onBackdropPress={() => setOtpModalVisible(false)} onBackButtonPress={() => setOtpModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verify {otpFor === 'email' ? 'Email' : 'Mobile'}</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="shield-key" size={20} color="#db9a4a" />
              <TextInput value={otp} onChangeText={setOtp} style={styles.textInput} keyboardType="number-pad" maxLength={6} placeholder="Enter OTP" placeholderTextColor="#8B7355" />
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={verifyAndUpdate} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'Verifying...' : 'VERIFY & UPDATE'}</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Text style={styles.label}>
          Gender<Required />
        </Text>
        <View style={styles.genderContainer}>
          {['Male', 'Female'].map((g) => (
            <TouchableOpacity key={g} style={[styles.genderButton, gender === g && styles.genderButtonActive]} onPress={() => setGender(g)}>
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>
          Date of Birth<Required />
        </Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputWrapper}>
          <MaterialCommunityIcons name="calendar" size={20} color="#db9a4a" />
          <Text style={styles.textInput}>{dateOfBirth ? formatDobDisplay(dateOfBirth) : 'Select date of birth'}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            onChange={(e, d) => {
              setShowDatePicker(false);
              d && setDateOfBirth(d);
            }}
          />
        )}

        <Text style={styles.label}>
          Time of Birth<Required />
        </Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputWrapper}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#db9a4a" />
          <Text style={styles.textInput}>{timeOfBirth ? moment(timeOfBirth).format('hh:mm A') : 'Select time of birth'}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={timeOfBirth || new Date()}
            mode="time"
            onChange={(e, t) => {
              setShowTimePicker(false);
              t && setTimeOfBirth(t);
            }}
          />
        )}

        <Text style={styles.label}>
          Place of Birth<Required />
        </Text>
        <PlaceInput
          value={placeOfBirth}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.textInput}
          iconColor="#db9a4a"
          onSelect={(loc) => {
            setPlaceOfBirth(loc.description);
            setLatitude(loc.latitude);
            setLongitude(loc.longitude);
          }}
        />
      </ScrollView>

      <View style={styles.fixedFooter}>
        <TouchableOpacity style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
          <Text style={styles.submitText}>{isLoading ? 'Submitting...' : 'SUBMIT'}</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalCard}>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() =>
              getProfilePic('capture', {
                mediaType: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              })
            }
          >
            <MaterialCommunityIcons name="camera" size={24} color="#db9a4a" />
            <Text style={styles.modalText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => getProfilePic('gallery', { mediaType: ImagePicker.MediaTypeOptions.Images, quality: 1 })}>
            <MaterialCommunityIcons name="image" size={24} color="#db9a4a" />
            <Text style={styles.modalText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  inlineOtpButton: { paddingHorizontal: 10, paddingVertical: 6, borderLeftWidth: 1, borderLeftColor: '#E8E4DC' },
  inlineOtpText: { fontSize: 12, fontWeight: '700', color: '#db9a4a' },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E8E4DC', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 60 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#db9a4a', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FAF8F5' },
  label: { marginTop: 16, marginBottom: 4, fontSize: 14, fontWeight: '700', color: '#2C1810' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#2C1810', marginBottom: 16, textAlign: 'center' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8E4DC', paddingVertical: 12, marginBottom: 16 },
  textInput: { flex: 1, fontSize: 15, color: '#2C1810', marginLeft: 8 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  genderButton: { flex: 1, marginHorizontal: 4, padding: 12, borderWidth: 1, borderColor: '#E8E4DC', alignItems: 'center', borderRadius: 4 },
  genderButtonActive: { borderColor: '#db9a4a', backgroundColor: '#FFF5E6' },
  genderText: { color: '#8B7355' },
  genderTextActive: { color: '#db9a4a', fontWeight: '600' },
  fixedFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FAF8F5', borderTopWidth: 1, borderTopColor: '#E8E4DC' },
  submitButton: { backgroundColor: '#db9a4a', paddingVertical: 16, borderRadius: 6, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontWeight: '700' },
  submitButtonDisabled: { opacity: 0.6 },
  modalCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 6 },
  modalOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  modalText: { color: '#2C1810', fontSize: 15 },
});
