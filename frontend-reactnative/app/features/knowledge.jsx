<<<<<<< HEAD
// file: frontend-reactnative/app/features/knowledge.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllKnowledge } from '../../src/services/knowledgeService'; 

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 30) / 4;

const KnowledgeScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Danh mục khớp với Enum hoặc String trong DB của bạn
  const categories = [
      { id: 'PHÂN LOẠI RÁC', label: 'Phân\nloại', icon: 'trash-can-outline', color: '#E3F2FD', textCol: '#1565C0' },
      { id: 'TÁI CHẾ', label: 'Tái\nchế', icon: 'recycle', color: '#F3E5F5', textCol: '#7B1FA2' },
      { id: 'SỐNG XANH', label: 'Sống\nxanh', icon: 'sprout-outline', color: '#E8F5E9', textCol: '#2E7D32' },
      { id: 'KHÍ HẬU', label: 'Khí\nhậu', icon: 'weather-sunny', color: '#FFF3E0', textCol: '#EF6C00' },
    
  ];

  useEffect(() => {
    fetchKnowledge();
  }, [selectedCategory]);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      // Backend: /api/knowledge?category=...
      const data = await getAllKnowledge(selectedCategory);
      setArticles(data || []);
    } catch (error) {
      console.error("Failed to load knowledge:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (catId) => {
    setSelectedCategory(catId === selectedCategory ? null : catId);
  };

  const filteredArticles = articles.filter(item => 
    item.title?.toLowerCase().includes(searchText.toLowerCase())
  );
=======
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 30) / 4; // Chia đều 4 cột

const KnowledgeScreen = () => {
  const [searchText, setSearchText] = useState('');

  const categories = [
    { id: 1, label: 'Phân\nloại', icon: 'recycle', color: '#E3F2FD', textCol: '#1565C0' },
    { id: 2, label: 'Tái\nchế', icon: 'palette-outline', color: '#F3E5F5', textCol: '#7B1FA2' },
    { id: 3, label: 'Sống\nxanh', icon: 'sprout-outline', color: '#E8F5E9', textCol: '#2E7D32' },
    { id: 4, label: 'Giảm\nrác', icon: 'delete-outline', color: '#FFF3E0', textCol: '#EF6C00' },
  ];

  const articles = [
    { id: 1, title: 'Cách phân loại rác tại nhà hiệu quả', tag: 'Phân loại', time: '5 phút', views: 1234, icon: 'trash-can-outline' },
    { id: 2, title: 'Làm chậu cây từ chai nhựa cũ', tag: 'Tái chế', time: '10 phút', views: 856, icon: 'flower-outline' },
    { id: 3, title: 'Lợi ích của việc đi xe đạp', tag: 'Sống xanh', time: '3 phút', views: 2300, icon: 'bike' },
  ];
>>>>>>> test-merge

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={24} color="#999" style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.input} 
<<<<<<< HEAD
            placeholder="Tìm kiếm kiến thức..." 
=======
            placeholder="Tìm kiếm bài viết..." 
>>>>>>> test-merge
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Danh mục</Text>
        <View style={styles.catContainer}>
          {categories.map((cat) => (
<<<<<<< HEAD
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.catCard, 
                { backgroundColor: cat.color },
                selectedCategory === cat.id && styles.catCardSelected
              ]}
              onPress={() => handleCategoryPress(cat.id)}
            >
=======
            <TouchableOpacity key={cat.id} style={[styles.catCard, { backgroundColor: cat.color }]}>
>>>>>>> test-merge
              <MaterialCommunityIcons name={cat.icon} size={28} color={cat.textCol} style={{ marginBottom: 8 }} />
              <Text style={[styles.catText, { color: cat.textCol }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

<<<<<<< HEAD
        {/* List Content */}
        <Text style={styles.sectionTitle}>
            {selectedCategory ? 'Bài viết lọc theo danh mục' : 'Mới nhất'}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{marginTop: 20}} />
        ) : (
          <View style={styles.listContainer}>
            {filteredArticles.length > 0 ? filteredArticles.map((item) => (
              <TouchableOpacity key={item.id} style={styles.articleCard}>
                <View style={styles.thumb}>
                   {/* Backend trả về 'thumbnailUrl' */}
                   {item.thumbnailUrl ? (
                     <Image source={{uri: item.thumbnailUrl}} style={styles.thumbImage} resizeMode="cover" />
                   ) : (
                     <MaterialCommunityIcons name="book-open-page-variant" size={30} color="#666" />
                   )}
                </View>
                <View style={styles.info}>
                   <View style={styles.tagRow}>
                      <Text style={styles.tag}>{item.category || 'Kiến thức'}</Text>
                      {item.type && <Text style={[styles.tag, {marginLeft: 5, backgroundColor: '#E0F7FA'}]}>{item.type}</Text>}
                   </View>
                   <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                   <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="eye-outline" size={14} color="#888" />
                      <Text style={styles.metaText}>{item.viewCount || 0} lượt xem</Text>
                   </View>
                </View>
              </TouchableOpacity>
            )) : (
              <Text style={{textAlign: 'center', color: '#999', marginTop: 20}}>Chưa có bài viết nào.</Text>
            )}
          </View>
        )}
=======
        {/* Featured */}
        <View style={styles.featuredHeader}>
           <Text style={styles.sectionTitle}>Nổi bật</Text>
           <TouchableOpacity><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {articles.map((item) => (
            <TouchableOpacity key={item.id} style={styles.articleCard}>
              <View style={styles.thumb}>
                 <MaterialCommunityIcons name={item.icon} size={30} color="#666" />
              </View>
              <View style={styles.info}>
                 <View style={styles.tagRow}>
                    <Text style={styles.tag}>{item.tag}</Text>
                 </View>
                 <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                 <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
                    <Text style={styles.metaText}>{item.time}</Text>
                    <Text style={[styles.metaText, { marginLeft: 10 }]}>• {item.views} lượt xem</Text>
                 </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
>>>>>>> test-merge

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { padding: 24 },
<<<<<<< HEAD
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 16 },
  catContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  catCard: { width: CARD_WIDTH, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  catCardSelected: { borderWidth: 2, borderColor: '#111' },
  catText: { fontSize: 12, fontWeight: '600', textAlign: 'center', lineHeight: 16 },
  listContainer: { gap: 16 },
  articleCard: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  thumb: { width: 70, height: 70, backgroundColor: '#F5F5F5', borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
=======

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 },
  input: { flex: 1, fontSize: 16, color: '#333' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 16 },
  
  catContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  catCard: { width: CARD_WIDTH, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  catText: { fontSize: 12, fontWeight: '600', textAlign: 'center', lineHeight: 16 },

  featuredHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { fontSize: 14, color: '#007AFF', fontWeight: '500' },

  listContainer: { gap: 16 },
  articleCard: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  thumb: { width: 70, height: 70, backgroundColor: '#F5F5F5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
>>>>>>> test-merge
  info: { flex: 1, marginLeft: 16 },
  tagRow: { flexDirection: 'row', marginBottom: 4 },
  tag: { fontSize: 10, color: '#666', backgroundColor: '#F0F0F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  articleTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#888', marginLeft: 4 },
});

export default KnowledgeScreen;