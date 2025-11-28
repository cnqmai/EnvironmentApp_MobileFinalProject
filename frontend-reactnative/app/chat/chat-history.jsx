import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getChatHistory } from '../../src/services/chatbotService'; // Import hàm lấy lịch sử
import typography from '../../styles/typography';

const ChatHistoryScreen = () => {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm load dữ liệu
  const fetchHistory = async () => {
    try {
      const data = await getChatHistory();
      setHistory(data);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động load lại mỗi khi vào màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  // Hàm format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>
      
      {/* Câu hỏi của người dùng */}
      <View style={styles.qaContainer}>
        <Text style={styles.label}>Bạn:</Text>
        <Text style={styles.questionText} numberOfLines={2}>{item.userMessage}</Text>
      </View>

      {/* Đường kẻ phân cách mờ */}
      <View style={styles.divider} />

      {/* Câu trả lời của Bot */}
      <View style={styles.qaContainer}>
        <Text style={[styles.label, { color: '#4CAF50' }]}>Bot:</Text>
        <Text style={styles.answerText} numberOfLines={3}>{item.botResponse}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử trò chuyện</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Nội dung danh sách */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="message-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào.</Text>
              <TouchableOpacity 
                style={styles.newChatButton}
                onPress={() => router.back()} // Quay lại màn hình chat
              >
                <Text style={styles.newChatButtonText}>Bắt đầu chat ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Shadow cho card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#888',
  },
  qaContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 2,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  answerText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  newChatButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  newChatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatHistoryScreen;