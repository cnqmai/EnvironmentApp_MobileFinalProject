import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions, Alert, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import YoutubePlayer from "react-native-youtube-iframe";

import { getKnowledgeById } from '../../../src/services/knowledgeService';

const { width } = Dimensions.get('window');

const ArticleDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (id) loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      const data = await getKnowledgeById(id);
      setArticle(data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      Alert.alert("Hoàn thành", "Bạn đã xem hết video và nhận thêm kiến thức xanh!");
    }
  }, []);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!article) return <View style={styles.centerBox}><Text>Không tìm thấy bài viết.</Text></View>;

  const videoId = article.type === 'VIDEO' ? getYouTubeId(article.videoUrl) : null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* HEADER AREA */}
      <View style={styles.mediaSection}>
        {/* Nút Back luôn hiển thị an toàn */}
        <SafeAreaView style={styles.safeHeader} edges={['top']}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>

        {article.type === 'VIDEO' && videoId ? (
            <View style={styles.videoContainer}>
                <YoutubePlayer
                    height={220}
                    width={width}
                    play={playing}
                    videoId={videoId}
                    onChangeState={onStateChange}
                    webViewProps={{
                        androidLayerType: 'hardware', // Tối ưu cho Android
                    }}
                />
            </View>
        ) : article.type === 'INFOGRAPHIC' ? (
            <View style={styles.infographicContainer}>
                <Image 
                    source={{ uri: article.thumbnailUrl || article.imageUrl || 'https://via.placeholder.com/400x600' }} 
                    style={styles.infographicImage}
                    resizeMode="contain"
                />
                <View style={styles.infographicBadge}>
                    <MaterialCommunityIcons name="image-multiple" size={20} color="#FFFFFF" />
                    <Text style={styles.infographicBadgeText}>Infographic</Text>
                </View>
            </View>
        ) : (
            <Image 
                source={{ uri: article.thumbnailUrl || 'https://via.placeholder.com/400x250' }} 
                style={styles.coverImage} 
            />
        )}
      </View>

      {/* CONTENT AREA */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
            {/* Meta Info */}
            <View style={styles.metaRow}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{article.category || 'Kiến thức'}</Text>
                </View>
                {article.type === 'VIDEO' && (
                    <View style={[styles.categoryBadge, {backgroundColor: '#FFEBEE', marginLeft: 8}]}>
                        <Text style={[styles.categoryText, {color: '#D32F2F'}]}>VIDEO</Text>
                    </View>
                )}
                {article.type === 'INFOGRAPHIC' && (
                    <View style={[styles.categoryBadge, {backgroundColor: '#F3E5F5', marginLeft: 8}]}>
                        <Text style={[styles.categoryText, {color: '#7B1FA2'}]}>INFOGRAPHIC</Text>
                    </View>
                )}
                <View style={{flex:1}} />
                <Text style={styles.dateText}>
                    {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                </Text>
            </View>

            <Text style={styles.title}>{article.title}</Text>

            {/* Author */}
            <View style={styles.authorSection}>
                <View style={styles.authorInfo}>
                    <MaterialCommunityIcons name="account-circle" size={40} color="#BDBDBD" />
                    <View style={{marginLeft: 10}}>
                        <Text style={styles.authorName}>{article.authorName || 'Ban biên tập'}</Text>
                        <Text style={styles.authorLabel}>Tác giả</Text>
                    </View>
                </View>
                <View style={styles.viewBadge}>
                    <MaterialCommunityIcons name="eye" size={16} color="#757575" />
                    <Text style={styles.viewCount}>{article.viewCount}</Text>
                </View>
            </View>

            <View style={styles.divider} />
            
            {/* Hiển thị infographic lớn trong content nếu là loại INFOGRAPHIC */}
            {article.type === 'INFOGRAPHIC' && article.thumbnailUrl && (
                <View style={styles.infographicContentContainer}>
                    <Image 
                        source={{ uri: article.thumbnailUrl || article.imageUrl }} 
                        style={styles.infographicContentImage}
                        resizeMode="contain"
                    />
                </View>
            )}
            
            <Text style={styles.textContent}>{article.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Media Section
  mediaSection: {
    width: width,
    height: 280, // Chiều cao cố định cho phần header media
    backgroundColor: '#000',
    position: 'relative',
    justifyContent: 'center'
  },
  videoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20 // Đẩy xuống một chút để tránh header
  },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.9 },
  
  // Infographic Section
  infographicContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  infographicImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  infographicBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 39, 176, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6
  },
  infographicBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  
  // Custom Header Back Button
  safeHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },

  // Content
  contentScroll: { flex: 1, backgroundColor: '#FFF', marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  body: { padding: 24 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  categoryBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  categoryText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },
  dateText: { color: '#9E9E9E', fontSize: 12 },

  title: { fontSize: 22, fontWeight: 'bold', color: '#212121', marginBottom: 20, lineHeight: 30 },

  authorSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  authorInfo: { flexDirection: 'row', alignItems: 'center' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#424242' },
  authorLabel: { fontSize: 12, color: '#9E9E9E' },
  viewBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  viewCount: { fontSize: 12, color: '#757575', marginLeft: 4 },

  divider: { height: 1, backgroundColor: '#EEEEEE', marginBottom: 20 },
  
  // Infographic in content
  infographicContentContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center'
  },
  infographicContentImage: {
    width: '100%',
    minHeight: 300,
    maxHeight: 800,
    borderRadius: 8
  },
  
  textContent: { fontSize: 16, lineHeight: 26, color: '#424242', textAlign: 'justify' }
});

export default ArticleDetailScreen;