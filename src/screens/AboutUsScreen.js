import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AboutUsScreen({ navigation }) {
  const handleBookNow = () => {
    if (navigation?.navigate) navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroPlaceholder}>
            <MaterialCommunityIcons name="star-circle" size={64} color="#db9a4a" />
            <Text style={styles.heroTitle}>AstroBook</Text>
            <Text style={styles.heroSubtitle}>Vedic Astrology & Life Guidance</Text>
            <TouchableOpacity style={styles.heroButton} onPress={handleBookNow} activeOpacity={0.9}>
              <Text style={styles.heroButtonText}>Book Consultation</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About AstroBook</Text>
          <Text style={styles.sectionBodyText}>
            AstroBook is a modern astrology and spiritual guidance platform designed to help you gain clarity, confidence and direction at every important phase of life. We bring together celebrity astrologers, Vedic experts and life guidance specialists on one trusted app.
          </Text>
          <Text style={styles.sectionTitle}>Our Experts</Text>
          <Text style={styles.sectionBodyText}>
            AstroBook partners with renowned astrologers including Celebrity Astrologer Acharya Lav Bhushan, along with a curated panel of experienced professionals. Each expert is vetted for knowledge, experience and ethics.
          </Text>
          <Text style={styles.sectionTitle}>Astro Guidance</Text>
          <Text style={styles.sectionBodyText}>
            Our consultations focus on understanding your horoscope, identifying opportunities and challenges, and helping you take informed life decisions. The goal is clarity, balance and inner peace.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why People Trust Us</Text>
          <Text style={styles.sectionSubtitle}>Authentic Vedic guidance backed by experience and ethics.</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="account-star" size={26} color="#B6732F" />
              <Text style={styles.statTitle}>Decades of Experience</Text>
              <Text style={styles.statText}>Years of practice with thousands of charts analyzed.</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="gesture-tap" size={26} color="#B6732F" />
              <Text style={styles.statTitle}>Personalised Guidance</Text>
              <Text style={styles.statText}>Remedies suggested as per your situation and comfort.</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="earth" size={26} color="#B6732F" />
              <Text style={styles.statTitle}>Online & Global</Text>
              <Text style={styles.statText}>Video, audio and chat consultations worldwide.</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="shield-check" size={26} color="#B6732F" />
              <Text style={styles.statTitle}>Honest & Ethical</Text>
              <Text style={styles.statText}>No fear-based predictions – clear, confidential guidance.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionBodyText}>
            To make astrology genuinely useful – a roadmap for life. We aim to empower you with clarity and help you take better decisions with authentic Vedic knowledge and practical remedies.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.serviceCard}>
            <MaterialCommunityIcons name="account-voice" size={22} color="#B6732F" />
            <View style={styles.serviceTextWrapper}>
              <Text style={styles.serviceTitle}>Personal Consultations</Text>
              <Text style={styles.serviceText}>One-to-one sessions on love, career, health and more.</Text>
            </View>
          </View>
          <View style={styles.serviceCard}>
            <MaterialCommunityIcons name="school-outline" size={22} color="#B6732F" />
            <View style={styles.serviceTextWrapper}>
              <Text style={styles.serviceTitle}>Courses & Learning</Text>
              <Text style={styles.serviceText}>Structured courses for learning astrology and Vastu.</Text>
            </View>
          </View>
          <View style={styles.serviceCard}>
            <MaterialCommunityIcons name="hand-coin" size={22} color="#B6732F" />
            <View style={styles.serviceTextWrapper}>
              <Text style={styles.serviceTitle}>Puja & Remedies</Text>
              <Text style={styles.serviceText}>Pujas, anushthans and karma-based remedies as per your chart.</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Ready to Get Clarity?</Text>
          <Text style={styles.footerText}>
            A focused astrology session can help you understand the bigger picture and choose the right path ahead.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBookNow} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Schedule a Session</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffff8' },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 24 },
  heroCard: { marginBottom: 18 },
  heroPlaceholder: {
    backgroundColor: '#FFF5E6',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginTop: 8 },
  heroSubtitle: { fontSize: 14, color: '#6A6A6A', marginBottom: 16 },
  heroButton: {
    backgroundColor: '#B6732F',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  heroButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  sectionSubtitle: { fontSize: 13, color: '#6A6A6A', marginBottom: 12 },
  sectionBodyText: { fontSize: 13, color: '#474747', lineHeight: 20, marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    elevation: 1,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  statTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginTop: 6, marginBottom: 4 },
  statText: { fontSize: 12, color: '#5A5A5A', lineHeight: 17 },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    alignItems: 'flex-start',
  },
  serviceTextWrapper: { flex: 1, marginLeft: 10 },
  serviceTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  serviceText: { fontSize: 12, color: '#555', lineHeight: 18 },
  footerCard: {
    backgroundColor: '#FFF2DF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  footerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  footerText: { fontSize: 13, color: '#4A4A4A', lineHeight: 19, marginBottom: 10 },
  primaryButton: { backgroundColor: '#B6732F', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  bottomSpace: { height: 10 },
});
