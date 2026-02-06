import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../config/apiConfig';

const IMAGE_BASE_URL = 'https://alb-web-assets.s3.ap-south-1.amazonaws.com/acharyalavbhushan/uploads/';

export default function BlogScreen() {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchBlogs = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const response = await axios.get(`${api}/customers/all_blogs?page=${page}&limit=${limit}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const newBlogs = response.data?.results || [];
      if (newBlogs.length === 0) {
        setHasMore(false);
      } else {
        setBlogs((prev) => [...prev, ...newBlogs]);
      }
    } catch (err) {
      console.log('Error fetching blogs:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.blogCard} activeOpacity={0.8}>
      <Image
        source={{
          uri: item.image
            ? item.image.startsWith('http')
              ? item.image
              : `${IMAGE_BASE_URL}${item.image}`
            : 'https://via.placeholder.com/400x200?text=Blog+Image',
        }}
        style={styles.blogImage}
      />
      <View style={styles.blogContent}>
        <View style={styles.categoryRow}>
          <MaterialCommunityIcons name="tag-outline" size={16} color="#db9a4a" />
          <Text style={styles.categoryText}>{item.blogCategoryId?.blog_category || 'General'}</Text>
        </View>
        <Text style={styles.blogTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.blogAuthor}>By {item.created_by || 'AstroBook'}</Text>
        <Text style={styles.blogDate}>{new Date(item.createdAt).toDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={blogs}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={<Text style={styles.pageTitle}>Blogs</Text>}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#db9a4a" style={{ marginVertical: 20 }} /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={60} color="#db9a4a" />
              <Text style={styles.emptyText}>No blogs available</Text>
            </View>
          ) : null
        }
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
  blogImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#FFF5E6',
  },
  blogContent: { padding: 12 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  categoryText: { marginLeft: 6, fontSize: 12, color: '#db9a4a', fontWeight: '600' },
  blogTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  blogAuthor: { fontSize: 12, color: '#666', marginBottom: 2 },
  blogDate: { fontSize: 11, color: '#999' },
  emptyState: { alignItems: 'center', paddingVertical: 120 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 16 },
});
