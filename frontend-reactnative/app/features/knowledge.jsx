import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllKnowledge } from '../../src/services/knowledgeService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 30) / 4; 

const KnowledgeScreen = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // Filter theo loại: ARTICLE, VIDEO, INFOGRAPHIC

  const categories = [
    { id: 'PHAN_LOAI', label: 'Phân\nloại', icon: 'recycle', color: '#E3F2FD', textCol: '#1565C0' },
    { id: 'TAI_CHE', label: 'Tái\nchế', icon: 'palette-outline', color: '#F3E5F5', textCol: '#7B1FA2' },
    { id: 'SONG_XANH', label: 'Sống\nxanh', icon: 'sprout-outline', color: '#E8F5E9', textCol: '#2E7D32' },
    { id: 'GIAM_RAC', label: 'Giảm\nrác', icon: 'delete-outline', color: '#FFF3E0', textCol: '#EF6C00' },
  ];

  // Gọi API mỗi khi category, type hoặc searchText thay đổi
  useEffect(() => {
    // Sử dụng debounce đơn giản với timeout để tránh gọi API quá nhiều khi gõ
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500); // Đợi 500ms sau khi ngừng gõ

    return () => clearTimeout(delayDebounceFn);
}, [searchText, selectedCategory, selectedType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi API với cả search text, category và type
      const data = await getAllKnowledge(selectedCategory, selectedType, searchText);
      setArticles(data);
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (catId) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catId);
    }
  };

  const clearSearch = () => {
    setSearchText('');
  };

  const getCategoryLabel = (catCode) => {
    const cat = categories.find(c => c.id === catCode);
    return cat ? cat.label.replace('\n', ' ') : 'Kiến thức';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thư viện Kiến thức</Text>
        <View style={{width: 40}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar Cải tiến */}
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={24} color="#999" style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.input} 
            placeholder="Tìm kiếm bài viết..." 
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Danh mục</Text>
        <View style={styles.catContainer}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity 
                key={cat.id} 
                style={[
                    styles.catCard, 
                    { backgroundColor: cat.color },
                    isSelected && { borderWidth: 2, borderColor: cat.textCol, transform: [{scale: 1.05}] }
                ]}
                onPress={() => handleCategoryPress(cat.id)}
              >
                <MaterialCommunityIcons name={cat.icon} size={28} color={cat.textCol} style={{ marginBottom: 8 }} />
                <Text style={[styles.catText, { color: cat.textCol }]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Type Filter */}
        <View style={styles.typeFilterContainer}>
          <TouchableOpacity 
            style={[styles.typeFilterBtn, !selectedType && styles.typeFilterBtnActive]}
            onPress={() => setSelectedType(null)}
          >
            <Text style={[styles.typeFilterText, !selectedType && styles.typeFilterTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeFilterBtn, selectedType === 'ARTICLE' && styles.typeFilterBtnActive]}
            onPress={() => setSelectedType(selectedType === 'ARTICLE' ? null : 'ARTICLE')}
          >
            <MaterialCommunityIcons name="text" size={16} color={selectedType === 'ARTICLE' ? '#007AFF' : '#666'} />
            <Text style={[styles.typeFilterText, selectedType === 'ARTICLE' && styles.typeFilterTextActive]}>Bài viết</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeFilterBtn, selectedType === 'VIDEO' && styles.typeFilterBtnActive]}
            onPress={() => setSelectedType(selectedType === 'VIDEO' ? null : 'VIDEO')}
          >
            <MaterialCommunityIcons name="video" size={16} color={selectedType === 'VIDEO' ? '#FF5722' : '#666'} />
            <Text style={[styles.typeFilterText, selectedType === 'VIDEO' && styles.typeFilterTextActive]}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeFilterBtn, selectedType === 'INFOGRAPHIC' && styles.typeFilterBtnActive]}
            onPress={() => setSelectedType(selectedType === 'INFOGRAPHIC' ? null : 'INFOGRAPHIC')}
          >
            <MaterialCommunityIcons name="image-multiple" size={16} color={selectedType === 'INFOGRAPHIC' ? '#9C27B0' : '#666'} />
            <Text style={[styles.typeFilterText, selectedType === 'INFOGRAPHIC' && styles.typeFilterTextActive]}>Infographic</Text>
          </TouchableOpacity>
        </View>

        {/* List Header */}
        <View style={styles.featuredHeader}>
           <Text style={styles.sectionTitle}>
             {searchText ? `Kết quả cho "${searchText}"` : (selectedCategory ? getCategoryLabel(selectedCategory) : 'Mới nhất')}
           </Text>
        </View>

        {loading ? (
            <ActivityIndicator size="large" color="#2E7D32" style={{marginTop: 20}} />
        ) : (
            <View style={styles.listContainer}>
            {articles.map((item) => (
                <TouchableOpacity 
                    key={item.id} 
                    style={styles.articleCard}
                    onPress={() => router.push(`/features/knowledge/${item.id}`)}
                >
                <Image 
                    source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/150' }} 
                    style={styles.thumb} 
                />
                <View style={styles.info}>
                    <View style={styles.tagRow}>
                        <Text style={styles.tag}>{item.category || 'Chung'}</Text>
                        <View style={{flex: 1}}/>
                        {item.type === 'VIDEO' && <MaterialCommunityIcons name="video" size={16} color="#FF5722" />}
                        {item.type === 'INFOGRAPHIC' && <MaterialCommunityIcons name="image-multiple" size={16} color="#9C27B0" />}
                    </View>
                    <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.metaRow}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
                        <Text style={styles.metaText}>
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                        <Text style={[styles.metaText, { marginLeft: 10 }]}>• {item.viewCount} xem</Text>
                    </View>
                </View>
                </TouchableOpacity>
            ))}
            {articles.length === 0 && (
                <View style={{alignItems: 'center', marginTop: 20}}>
                    <MaterialCommunityIcons name="text-box-search-outline" size={48} color="#ddd" />
                    <Text style={{textAlign: 'center', color: '#999', marginTop: 10}}>
                        Không tìm thấy bài viết nào.
                    </Text>
                </View>
            )}
            </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  scrollContent: { padding: 24 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 },
  input: { flex: 1, fontSize: 16, color: '#333' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 16 },
  
  catContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  catCard: { width: CARD_WIDTH, height: 100, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  catText: { fontSize: 12, fontWeight: '600', textAlign: 'center', lineHeight: 16 },

  featuredHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  
  // Type Filter
  typeFilterContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
    paddingHorizontal: 4
  },
  typeFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6
  },
  typeFilterBtnActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 2
  },
  typeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666'
  },
  typeFilterTextActive: {
    color: '#007AFF',
    fontWeight: '700'
  },

  listContainer: { gap: 16 },
  articleCard: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  thumb: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tag: { fontSize: 10, color: '#666', backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontWeight: 'bold' },
  articleTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 12, color: '#888', marginLeft: 4 },
});

export default KnowledgeScreen;