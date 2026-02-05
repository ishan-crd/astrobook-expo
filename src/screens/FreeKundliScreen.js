import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FreeKundliScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [place, setPlace] = useState('');

  const handleCreate = () => {
    Alert.alert('Demo', 'Kundli creation will be connected to backend later.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#db9a4a" />
          <Text style={styles.headerTitle}>My Kundlis</Text>
        </View>
      </View>

      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="book-open-page-variant-outline" size={80} color="#CCC" />
        <Text style={styles.emptyTitle}>No Kundlis Yet</Text>
        <Text style={styles.emptySubtext}>Create a kundli with your birth details to get started.</Text>

        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="account" size={20} color="#999" />
            <TextInput
              style={styles.textInput}
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'Male' && styles.genderOptionSelected]}
              onPress={() => setGender('Male')}
            >
              <MaterialCommunityIcons name="gender-male" size={24} color={gender === 'Male' ? '#FFF' : '#666'} />
              <Text style={[styles.genderOptionText, gender === 'Male' && styles.genderOptionTextSelected]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'Female' && styles.genderOptionSelected]}
              onPress={() => setGender('Female')}
            >
              <MaterialCommunityIcons name="gender-female" size={24} color={gender === 'Female' ? '#FFF' : '#666'} />
              <Text style={[styles.genderOptionText, gender === 'Female' && styles.genderOptionTextSelected]}>Female</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Date of Birth *</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="calendar" size={20} color="#999" />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 15 Jan 1990"
              value={dob}
              onChangeText={setDob}
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.label}>Place of Birth *</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#999" />
            <TextInput
              style={styles.textInput}
              placeholder="City, State, Country"
              value={place}
              onChangeText={setPlace}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <MaterialCommunityIcons name="plus" size={22} color="#FFF" />
            <Text style={styles.createBtnText}>Create Kundli</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#2C1810' },
  emptyContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2C1810', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
  formScroll: { width: '100%' },
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
  textInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#2C1810' },
  genderRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  genderOptionSelected: { backgroundColor: '#db9a4a', borderColor: '#db9a4a' },
  genderOptionText: { fontSize: 15, fontWeight: '600', color: '#666' },
  genderOptionTextSelected: { color: '#FFF' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#db9a4a',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  createBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
