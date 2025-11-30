import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getAllKnowledge } from '../../src/services/knowledgeService'; // Đảm bảo đường dẫn đúng

const KnowledgeScreen = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState(null); // null (All), 'ARTICLE', 'VIDEO', 'INFOGRAPHIC'
    const router = useRouter();

    useEffect(() => {
        loadArticles();
    }, [filterType]);

    const loadArticles = async () => {
        setLoading(true);
        try {
            // Gọi API lấy danh sách
            const data = await getAllKnowledge(null, filterType);
            setArticles(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card} 
            // Điều hướng đến trang chi tiết (nếu có trang detail)
            onPress={() => router.push({ pathname: '/detail', params: { id: item.id, type: 'knowledge' } })}
        >
            {/* Giả sử item có field imageUrl, nếu không có thì dùng placeholder */}
            <Image 
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
                style={styles.cardImage} 
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardType}>{item.type}</Text>
                <Text numberOfLines={2} style={styles.cardSummary}>{item.summary}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {['ALL', 'ARTICLE', 'VIDEO', 'INFOGRAPHIC'].map((type) => (
                    <TouchableOpacity 
                        key={type} 
                        style={[styles.filterButton, (filterType === (type === 'ALL' ? null : type)) && styles.filterButtonActive]}
                        onPress={() => setFilterType(type === 'ALL' ? null : type)}
                    >
                        <Text style={[styles.filterText, (filterType === (type === 'ALL' ? null : type)) && styles.filterTextActive]}>
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={articles}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không có bài viết nào.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    filterContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
    filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, backgroundColor: '#eee' },
    filterButtonActive: { backgroundColor: '#4CAF50' },
    filterText: { color: '#666', fontSize: 12, fontWeight: '600' },
    filterTextActive: { color: '#fff' },
    listContent: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', elevation: 2 },
    cardImage: { width: '100%', height: 150 },
    cardContent: { padding: 12 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    cardType: { fontSize: 10, color: '#4CAF50', fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
    cardSummary: { fontSize: 14, color: '#666' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});

export default KnowledgeScreen;