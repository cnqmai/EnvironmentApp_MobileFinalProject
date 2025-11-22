import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Modal,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Avatar, IconButton, Searchbar } from "react-native-paper";
import { useRouter } from "expo-router";
import typography from "../../styles/typography";

// Services
import { getChatHistory } from "../../src/services/chatbotService";
import { getToken } from "../../src/utils/apiHelper";

const ChatBot = () => {
  const router = useRouter();
  const [threads, setThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        // Xử lý chưa đăng nhập nếu cần
        setLoading(false);
        return;
      }

      const historyData = await getChatHistory();
      
      // Chuyển đổi dữ liệu từ API sang format của UI
      // Giả sử API trả về mảng các session
      const formattedThreads = historyData.map(item => ({
        id: item.id.toString(),
        title: item.title || "Cuộc trò chuyện mới",
        snippet: item.lastMessage || "...",
        time: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('vi-VN') : "",
        unread: false // Cần logic check unread từ API nếu có
      }));

      setThreads(formattedThreads);
    } catch (error) {
      console.error("Lỗi lấy lịch sử chat:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const deleteThread = (id) => {
    // Cần thêm API delete nếu backend hỗ trợ
    setThreads(threads.filter((t) => t.id !== id));
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newChatTopics = [
    { id: 1, title: "Phân loại rác", icon: "♻️", description: "Hướng dẫn phân loại rác tái chế" },
    { id: 2, title: "Chất lượng không khí", icon: "🌫️", description: "Kiểm tra AQI và khuyến cáo" },
    { id: 3, title: "Thu gom rác thải", icon: "📍", description: "Tìm điểm thu gom gần bạn" },
    { id: 4, title: "Luật môi trường", icon: "📋", description: "Quy định và chính sách" },
    { id: 5, title: "Tiết kiệm năng lượng", icon: "💡", description: "Mẹo giảm tiêu thụ điện" },
    { id: 6, title: "Trò chuyện tự do", icon: "💬", description: "Hỏi bất kỳ điều gì về môi trường" },
  ];

  const createNewChat = (topic) => {
    setShowNewChatModal(false);
    // Điều hướng sang màn hình chat chi tiết với ID mới hoặc topic
    router.push(
        `/chat/chat-history?title=${encodeURIComponent(topic.title)}&isNew=true`
    );
  };

  // ... Giữ nguyên hàm renderItem và EmptyState ...
  // (Chỉ thay đổi phần gọi API trong renderItem nếu cần thiết)
  
  const renderItem = ({ item }) => {
    // ... (Giữ nguyên logic animation)
     const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() =>
            router.push(
              `/chat/chat-history?threadId=${item.id}&title=${encodeURIComponent(item.title)}`
            )
          }
        >
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={48}
              label={(item.title || "C")
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            {item.unread && <View style={styles.unreadBadge} />}
          </View>
          <View style={styles.rowText}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.threadTitle, item.unread && styles.unreadTitle]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.unread && <View style={styles.unreadDot} />}
            </View>
            <Text
              style={[
                styles.threadSnippet,
                item.unread && styles.unreadSnippet,
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.snippet}
            </Text>
            <Text style={styles.threadTime}>{item.time}</Text>
          </View>
          <TouchableOpacity
            onPress={() => deleteThread(item.id)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconButton icon="delete-outline" size={20} iconColor="#999" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>💬</Text>
      </View>
      <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện</Text>
      <Text style={styles.emptySubtitle}>
        Bắt đầu trò chuyện mới với chatbot môi trường để nhận hỗ trợ
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowNewChatModal(true)}
      >
        <Text style={styles.emptyButtonText}>Bắt đầu trò chuyện</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
        {/* ... Header code như cũ ... */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
            <IconButton icon="arrow-left" size={24} iconColor="#0A0A0A" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
            <Text style={styles.title}>Chatbot môi trường</Text>
            <Text style={styles.subtitle}>{threads.length} cuộc trò chuyện</Text>
            </View>
            <TouchableOpacity onPress={() => setShowNewChatModal(true)} style={styles.headerRight}>
            <View style={styles.newChatButton}>
                <IconButton icon="plus" size={24} iconColor="#fff" />
            </View>
            </TouchableOpacity>
        </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm cuộc trò chuyện..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#666"
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={filteredThreads}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            filteredThreads.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={EmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal logic giữ nguyên */}
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
                <Text style={styles.modalTitle}>Bắt đầu trò chuyện mới</Text>
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

// Styles giữ nguyên
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F8" },
  header: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: { width: 56 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerRight: { width: 56, alignItems: "flex-end" },
  title: {
    ...typography.h2,
    fontWeight: "700",
    color: "#0A0A0A",
    fontSize: 18,
  },
  subtitle: {
    ...typography.small,
    color: "#666",
    marginTop: 2,
    fontSize: 12,
  },
  newChatButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 28,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
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
  },
  searchInput: {
    ...typography.body,
    fontSize: 14,
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    backgroundColor: "#E8F5E9",
  },
  avatarLabel: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 16,
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  rowText: {
    flex: 1,
    paddingTop: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  threadTitle: {
    ...typography.h3,
    fontWeight: "600",
    color: "#0A0A0A",
    fontSize: 15,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  threadSnippet: {
    ...typography.body,
    color: "#666",
    lineHeight: 20,
    fontSize: 14,
  },
  unreadSnippet: {
    color: "#0A0A0A",
    fontWeight: "500",
  },
  threadTime: {
    ...typography.small,
    color: "#999",
    marginTop: 8,
    fontSize: 12,
  },
  deleteButton: {
    marginLeft: 4,
    marginTop: -4,
  },
  separator: { height: 12 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 48,
  },
  emptyTitle: {
    ...typography.h2,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    ...typography.body,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  emptyButtonText: {
    ...typography.h3,
    color: "#fff",
    fontWeight: "600",
  },

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
    paddingTop: 8,
    maxHeight: "80%",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
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
    backgroundColor: "#F6F7F8",
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  topicIconText: {
    fontSize: 24,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    ...typography.h3,
    fontWeight: "600",
    color: "#0A0A0A",
    fontSize: 16,
    marginBottom: 4,
  },
  topicDescription: {
    ...typography.body,
    color: "#666",
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ChatBot;