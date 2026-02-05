import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ContactScreen() {
  const email = 'info@acharyalavbhushan.com';
  const phone = '+91 92579 91666';
  const address = 'Plot no. 177, Near Suresh Gyan Vihar University, OBC Colony, Jagatpura, Jaipur, Rajasthan';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Contact Us</Text>
        <Text style={styles.subtitle}>Reach out for consultations and support</Text>

        <View style={styles.card}>
          <MaterialCommunityIcons name="email-outline" size={28} color="#db9a4a" />
          <View style={styles.cardText}>
            <Text style={styles.label}>Email</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)}>
              <Text style={styles.value}>{email}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons name="phone" size={28} color="#db9a4a" />
          <View style={styles.cardText}>
            <Text style={styles.label}>Consultation queries</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`)}>
              <Text style={styles.value}>{phone}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons name="map-marker-outline" size={28} color="#db9a4a" />
          <View style={styles.cardText}>
            <Text style={styles.label}>Office</Text>
            <Text style={styles.value}>{address}</Text>
          </View>
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL('https://www.facebook.com/acharyalavbhushan09/')}>
            <MaterialCommunityIcons name="facebook" size={28} color="#9C7A56" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL('https://www.instagram.com/acharyalavbhushan/')}>
            <MaterialCommunityIcons name="instagram" size={28} color="#9C7A56" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL('https://www.linkedin.com/in/acharyalavbhushan/')}>
            <MaterialCommunityIcons name="linkedin" size={28} color="#9C7A56" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL('https://www.youtube.com/@acharyalavbhushan')}>
            <MaterialCommunityIcons name="youtube" size={28} color="#9C7A56" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#2C1810', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardText: { flex: 1, marginLeft: 14 },
  label: { fontSize: 12, color: '#9C7A56', marginBottom: 4 },
  value: { fontSize: 15, color: '#2C1810', fontWeight: '500', lineHeight: 22 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 32 },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
