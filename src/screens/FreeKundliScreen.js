import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../config/apiConfig';

const ADD_KUNDLI_API = `${api}/kundli/add_kundli`;
const GET_KUNDLI_API = `${api}/kundli/get_customer_kundli`;
const DELETE_KUNDLI_API = `${api}/kundli/delete_kundli`;

export default function FreeKundliScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [place, setPlace] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [kundlis, setKundlis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const getCustomerId = async () => {
    const stored = await AsyncStorage.getItem('customerData');
    if (!stored) return null;
    return JSON.parse(stored)._id;
  };

  const loadKundlis = async () => {
    try {
      setFetchLoading(true);
      const customerId = await getCustomerId();
      if (!customerId) {
        setFetchLoading(false);
        return;
      }
      const res = await axios.post(GET_KUNDLI_API, { customerId });
      setKundlis(res?.data?.kundli || []);
    } catch (err) {
      console.log('Error loading kundlis:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    loadKundlis();
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter name');
      return false;
    }
    if (!gender) {
      Alert.alert('Error', 'Please select gender');
      return false;
    }
    if (!dob) {
      Alert.alert('Error', 'Please select date of birth');
      return false;
    }
    if (!hour || !minute) {
      Alert.alert('Error', 'Please select time of birth');
      return false;
    }
    if (!place.trim()) {
      Alert.alert('Error', 'Please enter place of birth');
      return false;
    }
    return true;
  };

  const generateKundli = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const customerId = await getCustomerId();
      if (!customerId) {
        Alert.alert('Error', 'Customer ID not found');
        setLoading(false);
        return;
      }

      const finalDob = `${dob}T00:00:00.000Z`;
      const finalTob = `${dob}T${hour}:${minute}:00`;

      const payload = {
        customerId,
        name: name.trim(),
        gender,
        dob: finalDob,
        tob: finalTob,
        place: place.trim(),
        lat: lat || '0',
        lon: lon || '0',
      };

      await axios.post(ADD_KUNDLI_API, payload);
      Alert.alert('Success', 'Kundli created successfully!');
      setName('');
      setGender('');
      setDob('');
      setHour('');
      setMinute('');
      setPlace('');
      setLat('');
      setLon('');
      setShowForm(false);
      loadKundlis();
    } catch (err) {
      Alert.alert('Error', 'Failed to create kundli');
    } finally {
      setLoading(false);
    }
  };

  const deleteKundli = async (id) => {
    Alert.alert('Delete Kundli', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const customerId = await getCustomerId();
            await axios.post(DELETE_KUNDLI_API, { customerId, kundliId: id });
            loadKundlis();
            Alert.alert('Success', 'Kundli deleted');
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const dateStr = date.toDateString();
    const [, timePart] = timeString.split('T');
    const [h, m] = timePart.split(':');
    const timeStr = `${h}:${m}`;
    return { date: dateStr, time: timeStr };
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#db9a4a" />
          <Text style={styles.headerTitle}>My Kundlis</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {fetchLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#db9a4a" />
        </View>
      ) : kundlis.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="book-open-page-variant-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>No Kundlis Yet</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowForm(true)}>
            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
            <Text style={styles.emptyButtonText}>Create Kundli</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={kundlis}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const { date, time } = formatDateTime(item.dob, item.tob);
            return (
              <View style={styles.kundliCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarCircle}>
                    <MaterialCommunityIcons
                      name={item.gender === 'Male' ? 'gender-male' : 'gender-female'}
                      size={28}
                      color="#db9a4a"
                    />
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <View style={styles.genderBadge}>
                      <Text style={styles.genderText}>{item.gender}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardDivider} />
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Date of Birth</Text>
                    <Text style={styles.detailValue}>{date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Time of Birth</Text>
                    <Text style={styles.detailValue}>{time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Place</Text>
                    <Text style={styles.detailValue}>{item.place}</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteKundli(item._id)}
                  >
                    <MaterialCommunityIcons name="delete" size={18} color="#D32F2F" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {showForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Kundli</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#2C1810" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={name}
                onChangeText={setName}
              />
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
              <Text style={styles.label}>Date of Birth * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1990-01-15"
                value={dob}
                onChangeText={setDob}
              />
              <Text style={styles.label}>Time of Birth *</Text>
              <View style={styles.timeRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Hour (00-23)"
                  value={hour}
                  onChangeText={setHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Minute (00-59)"
                  value={minute}
                  onChangeText={setMinute}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <Text style={styles.label}>Place of Birth *</Text>
              <TextInput
                style={styles.input}
                placeholder="City, State, Country"
                value={place}
                onChangeText={setPlace}
              />
              <TouchableOpacity style={styles.createBtn} onPress={generateKundli} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="plus" size={22} color="#FFF" />
                    <Text style={styles.createBtnText}>Create Kundli</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
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
  addButton: {
    backgroundColor: '#db9a4a',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2C1810', marginTop: 16 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#db9a4a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  listContent: { padding: 16 },
  kundliCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#2C1810' },
  genderBadge: {
    backgroundColor: '#FFF5E6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  genderText: { fontSize: 12, color: '#db9a4a', fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: '#E8DCC8', marginVertical: 12 },
  cardDetails: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontSize: 13, color: '#666', marginLeft: 8, marginRight: 8, minWidth: 100 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#2C1810', flex: 1 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: { color: '#D32F2F', fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DCC8',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C1810' },
  formContainer: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#2C1810', marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: '#F8F4EF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
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
  timeRow: { flexDirection: 'row', gap: 8 },
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
