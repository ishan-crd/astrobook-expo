import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DEMO_USER = {
  customerName: 'Demo User',
  phoneNumber: '9876543210',
  email: 'demo@example.com',
  gender: 'Male',
  dateOfBirth: 'Jan 15, 1990',
  timeOfBirth: '10:30 AM',
  placeOfBirth: 'Mumbai, India',
};

export default function ProfileScreen() {
  const [customerName, setCustomerName] = useState(DEMO_USER.customerName);
  const [phoneNumber, setPhoneNumber] = useState(DEMO_USER.phoneNumber);
  const [email, setEmail] = useState(DEMO_USER.email);
  const [gender, setGender] = useState(DEMO_USER.gender);
  const [placeOfBirth, setPlaceOfBirth] = useState(DEMO_USER.placeOfBirth);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    Alert.alert('Demo', 'Profile save is disabled in demo mode. Backend will be connected later.');
    setIsEditing(false);
  };

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
              <MaterialCommunityIcons name="account-circle" size={110} color="#db9a4a" />
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

          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="calendar" size={20} color="#db9a4a" />
            <Text style={[styles.textInput, !isEditing && styles.placeholder]}>{DEMO_USER.dateOfBirth}</Text>
          </View>

          <Text style={styles.label}>Time of Birth</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#db9a4a" />
            <Text style={[styles.textInput, !isEditing && styles.placeholder]}>{DEMO_USER.timeOfBirth}</Text>
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
            >
              <Text style={styles.primaryBtnText}>{isEditing ? 'Save' : 'Edit Profile'}</Text>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { alignItems: 'center', justifyContent: 'center' },
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
  placeholder: { color: '#999' },
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
