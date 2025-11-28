import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Avatar, IconButton, Searchbar } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router"; // Dùng useFocusEffect để reload khi quay lại
import typography from "../../styles/typography";

// Import Services (Đảm bảo bạn đã cập nhật chatbotService.js như hướng dẫn trước)
import { getChatSessions, deleteChatSession } from "../../src/services/chatbotService";
import { getToken } from "../../src/utils/apiHelper";

// Hàm tạo ID tạm thời (nếu không cài expo-crypto)
const generateTempId = () => Math.random().toString(36).substr(2, 9) + "-" + Date.now();

const ChatBot = () => {
  const router = useRouter();

  // --- STATES ---
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // --- 1. HÀM TẢI DANH SÁCH HỘI THOẠI ---
  const fetchSessions = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Gọi API lấy danh sách session (đã được gom nhóm ở Backend)
      const data = await getChatSessions();
      
      // Map dữ liệu từ API sang format UI
      const formattedSessions = data.map(item => ({
        id: item.sessionId || item.historyId?.toString(), // Ưu tiên dùng sessionId
        title: item.userQuery || "Cuộc trò chuyện mới",
        snippet: item.botResponse || "...",
        time: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : "",
        unread: false 
      }));

      setSessions(formattedSessions);
    } catch (error) {
      console.error("Lỗi tải danh sách chat:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Tải dữ liệu lần đầu
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Tự động tải lại danh sách khi người dùng quay lại màn hình này (ví dụ sau khi chat xong)
  useFocusEffect(
    useCallback(() => {
      fetchSessions();
    }, [fetchSessions])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  // --- 2. HÀM XÓA HỘI THOẠI ---
  const handleDelete = (sessionId) => {
    Alert.alert(
      "Xóa hội thoại",
      "Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              // Optimistic Update: Xóa trên giao diện trước
              const prevSessions = [...sessions];
              setSessions(prev => prev.filter(s => s.id !== sessionId));

              // Gọi API xóa
              await deleteChatSession(sessionId);
            } catch (error) {
              console.error("Lỗi xóa chat:", error);
              Alert.alert("Lỗi", "Không thể xóa hội thoại này.");
              fetchSessions(); // Rollback nếu lỗi
            }
          },
        },
      ]
    );
  };

  // --- 3. HÀM TẠO HỘI THOẠI MỚI ---
  const newChatTopics = [
    { id: 1, title: "Phân loại rác", icon: "♻️", description: "Hướng dẫn phân loại rác tại nguồn" },
    { id: 2, title: "Chất lượng không khí", icon: "🌫️", description: "Thông tin chỉ số AQI và sức khỏe" },
    { id: 3, title: "Điểm thu gom", icon: "📍", description: "Tìm điểm thu gom rác gần bạn" },
    { id: 4, title: "Sống xanh", icon: "🌱", description: "Mẹo sống thân thiện môi trường" },
    { id: 5, title: "Luật môi trường", icon: "⚖️", description: "Quy định và chính sách mới" },
    { id: 6, title: "Trò chuyện tự do", icon: "💬", description: "Hỏi đáp mọi thắc mắc" },
  ];

  const createNewChat = (topic) => {
    setShowNewChatModal(false);
    
    // Tạo một Session ID mới ở Client để bắt đầu phiên
    const newSessionId = generateTempId();

    // Điều hướng sang màn hình chat chi tiết
    router.push({
      pathname: "/chat/chat-history",
      params: {
        sessionId: newSessionId,
        title: topic.title,
        isNew: "true" // Đánh dấu là chat mới
      }
    });
  };

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredSessions = sessions.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render từng item trong danh sách
  const renderItem = ({ item }) => {
     const scaleAnim = new Animated.Value(1);

     // Hiệu ứng nút bấm
    const handlePressIn = () => {
      Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() =>
            // Khi bấm vào item, mở lại lịch sử chat đó
            router.push({
              pathname: "/chat/chat-history",
              params: {
                sessionId: item.id,
                title: item.title
              }
            })
          }
        >
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={48}
              label={(item.title || "C").charAt(0).toUpperCase()}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
          </View>
          
          <View style={styles.rowText}>
            <Text style={styles.threadTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.threadSnippet} numberOfLines={1}>
              {item.snippet}
            </Text>
            <Text style={styles.threadTime}>{item.time}</Text>
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconButton icon="delete-outline" size={20} iconColor="#999" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Giao diện khi danh sách trống
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>💬</Text>
      </View>
      <Text style={styles.emptyTitle}>Chưa có lịch sử chat</Text>
      <Text style={styles.emptySubtitle}>
        Bắt đầu hội thoại mới để nhận tư vấn từ trợ lý môi trường.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowNewChatModal(true)}
      >
        <Text style={styles.emptyButtonText}>Bắt đầu ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <IconButton icon="arrow-left" size={24} iconColor="#0A0A0A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Trợ lý Môi trường</Text>
          <Text style={styles.subtitle}>{sessions.length} cuộc hội thoại</Text>
        </View>
        <TouchableOpacity onPress={() => setShowNewChatModal(true)} style={styles.headerRight}>
          <View style={styles.newChatButton}>
            <IconButton icon="plus" size={24} iconColor="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#666"
        />
      </View>

      {/* Danh sách Chat */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            filteredSessions.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={EmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50"/>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal Chọn Chủ đề Mới */}
      <Modal
        visible={showNewChatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowNewChatModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Cuộc trò chuyện mới</Text>
                <Text style={styles.modalSubtitle}>
                  Chọn chủ đề bạn quan tâm
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowNewChatModal(false)}
                style={styles.modalCloseButton}
              >
                <IconButton icon="close" size={24} iconColor="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={newChatTopics}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.topicCard}
                  activeOpacity={0.7}
                  onPress={() => createNewChat(item)}
                >
                  <View style={styles.topicIcon}>
                    <Text style={styles.topicIconText}>{item.icon}</Text>
                  </View>
                  <View style={styles.topicContent}>
                    <Text style={styles.topicTitle}>{item.title}</Text>
                    <Text style={styles.topicDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <IconButton icon="chevron-right" size={24} iconColor="#999" />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.topicsList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F8" },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: { width: 50 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerRight: { width: 50, alignItems: "flex-end", paddingRight: 8 },
  title: {
    ...typography.h2,
    fontWeight: "700",
    color: "#0A0A0A",
    fontSize: 18,
  },
  subtitle: {
    ...typography.small,
    color: "#666",
    fontSize: 12,
  },
  newChatButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  searchBar: {
    elevation: 0,
    backgroundColor: "#F6F7F8",
    borderRadius: 12,
    height: 46,
  },
  searchInput: {
    ...typography.body,
    fontSize: 14,
    alignSelf: "center",
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    backgroundColor: "#E8F5E9",
  },
  avatarLabel: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 18,
  },
  rowText: {
    flex: 1,
    justifyContent: "center",
  },
  threadTitle: {
    ...typography.h3,
    fontWeight: "600",
    color: "#0A0A0A",
    fontSize: 16,
    marginBottom: 4,
  },
  threadSnippet: {
    ...typography.body,
    color: "#666",
    fontSize: 13,
    maxWidth: "95%",
  },
  threadTime: {
    ...typography.small,
    color: "#999",
    marginTop: 6,
    fontSize: 11,
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
  separator: { height: 12 },
  
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    ...typography.h2,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.body,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    ...typography.h2,
    fontWeight: "700",
    color: "#0A0A0A",
    fontSize: 20,
  },
  modalSubtitle: {
    ...typography.body,
    color: "#666",
    marginTop: 4,
    fontSize: 14,
  },
  modalCloseButton: {
    marginTop: -8,
    marginRight: -8,
  },
  topicsList: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  topicIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  topicIconText: {
    fontSize: 22,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    ...typography.h3,
    fontWeight: "600",
    color: "#0A0A0A",
    fontSize: 16,
    marginBottom: 2,
  },
  topicDescription: {
    ...typography.body,
    color: "#666",
    fontSize: 12,
  },
});

export default ChatBot;