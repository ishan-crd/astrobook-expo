import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DEMO_BLOGS = [
  { _id: '1', title: 'Understanding Your Moon Sign', category: 'Vedic Astrology', author: 'AstroBook', date: 'Jan 15, 2025' },
  { _id: '2', title: 'Remedies for Career Growth', category: 'Remedies', author: 'AstroBook', date: 'Jan 10, 2025' },
  { _id: '3', title: 'Marriage and Compatibility', category: 'Relationships', author: 'AstroBook', date: 'Jan 5, 2025' },
];

export default function BlogScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.blogCard}>
      <View style={styles.blogImagePlaceholder}>
        <MaterialCommunityIcons name="newspaper-variant" size={48} color="#db9a4a" />
      </View>
      <View style={styles.blogContent}>
        <View style={styles.categoryRow}>
          <MaterialCommunityIcons name="tag-outline" size={16} color="#db9a4a" />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.blogAuthor}>By {item.author}</Text>
        <Text style={styles.blogDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={DEMO_BLOGS}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.pageTitle}>Blogs</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF7EE' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  pageTitle: { fontSize: 22, fontWeight: '700', marginTop: 10, marginBottom: 16, color: '#1A1A1A' },
  blogCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 2,
  },
  blogImagePlaceholder: {
    height: 160,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blogContent: { padding: 12 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  categoryText: { marginLeft: 6, fontSize: 12, color: '#db9a4a', fontWeight: '600' },
  blogTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  blogAuthor: { fontSize: 12, color: '#666', marginBottom: 2 },
  blogDate: { fontSize: 11, color: '#999' },
});
