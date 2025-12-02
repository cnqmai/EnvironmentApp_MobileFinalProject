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
  Alert,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Avatar, IconButton, Searchbar } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router"; // Dùng useFocusEffect để reload khi quay lại
import { MaterialCommunityIcons } from "@expo/vector-icons";
import typography from "../../styles/typography";

// Import Services (Đảm bảo bạn đã cập nhật chatbotService.js như hướng dẫn trước)
import { getChatSessions, deleteChatSession } from "../../src/services/chatbotService";
import { getToken } from "../../src/utils/apiHelper";

// Hàm tạo ID tạm thời (nếu không cài expo-crypto)
const generateTempId = () => Math.random().toString(36).substr(2, 9) + "-" + Date.now();

// Hàm xác định mùa/sự kiện hiện tại
const getCurrentSeasonAndEvents = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  
  let season = "";
  let events = [];
  
  // Xác định mùa
  if (month >= 3 && month <= 5) {
    season = "Xuân";
  } else if (month >= 6 && month <= 8) {
    season = "Hè";
  } else if (month >= 9 && month <= 11) {
    season = "Thu";
  } else {
    season = "Đông";
  }
  
  // Xác định sự kiện đặc biệt
  if (month === 1 && day === 1) {
    events.push({ name: "Năm mới", icon: "🎉" });
  }
  if (month === 2 && day === 14) {
    events.push({ name: "Valentine", icon: "💝" });
  }
  if (month === 3 && day >= 20 && day <= 22) {
    events.push({ name: "Ngày Nước Thế giới", icon: "💧" });
  }
  if (month === 4 && day === 22) {
    events.push({ name: "Ngày Trái Đất", icon: "🌍" });
  }
  if (month === 5 && day === 5) {
    events.push({ name: "Ngày Môi trường Thế giới", icon: "🌱" });
  }
  if (month === 6 && day === 5) {
    events.push({ name: "Ngày Môi trường Thế giới", icon: "🌍" });
  }
  if (month === 9 && day >= 15 && day <= 17) {
    events.push({ name: "Tuần lễ Xanh", icon: "🌿" });
  }
  if (month === 10 && day === 31) {
    events.push({ name: "Halloween", icon: "🎃" });
  }
  if (month === 12 && day === 25) {
    events.push({ name: "Giáng sinh", icon: "🎄" });
  }
  
  return { season, events, month };
};

// Dữ liệu gợi ý hành động theo mùa/sự kiện
const getSeasonalActions = (season, month, events) => {
  const allActions = {
    Xuân: [
      { icon: "🌸", title: "Trồng cây xanh", description: "Mùa xuân là thời điểm lý tưởng để trồng cây, tạo không gian xanh cho ngôi nhà" },
      { icon: "🧹", title: "Dọn dẹp nhà cửa", description: "Tận dụng ánh sáng tự nhiên, mở cửa sổ thay vì dùng đèn điện" },
      { icon: "🚶", title: "Đi bộ nhiều hơn", description: "Thời tiết mát mẻ, hãy đi bộ thay vì đi xe để giảm khí thải" },
      { icon: "🌱", title: "Bắt đầu vườn rau", description: "Trồng rau sạch tại nhà, vừa tiết kiệm vừa bảo vệ môi trường" },
    ],
    Hè: [
      { icon: "💧", title: "Tiết kiệm nước", description: "Mùa hè nóng bức, hãy tái sử dụng nước và tưới cây vào sáng sớm" },
      { icon: "🌞", title: "Sử dụng năng lượng mặt trời", description: "Phơi quần áo ngoài trời, tắt điều hòa khi không cần thiết" },
      { icon: "🍉", title: "Ăn trái cây theo mùa", description: "Chọn trái cây địa phương, giảm vận chuyển và đóng gói" },
      { icon: "🏊", title: "Bảo vệ nguồn nước", description: "Không xả rác xuống biển, sông hồ khi đi du lịch" },
    ],
    Thu: [
      { icon: "🍂", title: "Thu gom lá rụng", description: "Ủ lá rụng thành phân hữu cơ thay vì đốt" },
      { icon: "🧥", title: "Quyên góp quần áo", description: "Dọn tủ quần áo, quyên góp cho người cần thay vì vứt bỏ" },
      { icon: "🌾", title: "Mua thực phẩm địa phương", description: "Hỗ trợ nông dân địa phương, giảm khí thải vận chuyển" },
      { icon: "🏠", title: "Chuẩn bị cho mùa đông", description: "Kiểm tra cách nhiệt nhà cửa, tiết kiệm năng lượng sưởi ấm" },
    ],
    Đông: [
      { icon: "🔥", title: "Tiết kiệm năng lượng", description: "Mặc ấm hơn, giảm nhiệt độ sưởi, tắt đèn không cần thiết" },
      { icon: "🧣", title: "Tái sử dụng đồ cũ", description: "Sửa chữa, tái chế đồ dùng thay vì mua mới" },
      { icon: "🍲", title: "Nấu ăn tại nhà", description: "Nấu ăn tại nhà, giảm đóng gói và vận chuyển từ nhà hàng" },
      { icon: "🎁", title: "Quà tặng bền vững", description: "Chọn quà tặng thân thiện môi trường, tránh đóng gói quá mức" },
    ],
  };
  
  let actions = allActions[season] || [];
  
  // Thêm hành động đặc biệt theo sự kiện
  if (events.length > 0) {
    const eventActions = {
      "Ngày Trái Đất": [
        { icon: "🌍", title: "Tham gia dọn rác cộng đồng", description: "Tham gia hoạt động dọn dẹp môi trường tại địa phương" },
        { icon: "♻️", title: "Cam kết giảm rác thải", description: "Đặt mục tiêu giảm rác thải nhựa trong tháng này" },
      ],
      "Ngày Môi trường Thế giới": [
        { icon: "🌱", title: "Trồng một cây xanh", description: "Trồng cây để góp phần làm sạch không khí" },
        { icon: "🚲", title: "Đi xe đạp thay vì xe máy", description: "Giảm khí thải bằng cách đi xe đạp trong ngày" },
      ],
      "Ngày Nước Thế giới": [
        { icon: "💧", title: "Kiểm tra rò rỉ nước", description: "Sửa chữa vòi nước bị rò rỉ để tiết kiệm nước" },
        { icon: "🚿", title: "Rút ngắn thời gian tắm", description: "Giảm thời gian tắm để tiết kiệm nước" },
      ],
    };
    
    events.forEach(event => {
      if (eventActions[event.name]) {
        actions = [...eventActions[event.name], ...actions];
      }
    });
  }
  
  return actions.slice(0, 4); // Chỉ hiển thị 4 hành động
};

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

  // Component hiển thị gợi ý hành động theo mùa/sự kiện
  const SeasonalActionsFooter = () => {
    const { season, events, month } = getCurrentSeasonAndEvents();
    const actions = getSeasonalActions(season, month, events);
    
    return (
      <View style={styles.seasonalContainer}>
        <View style={styles.seasonalHeader}>
          <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FF9800" />
          <View style={styles.seasonalHeaderText}>
            <Text style={styles.seasonalTitle}>Gợi ý hành động {season}</Text>
            {events.length > 0 && (
              <Text style={styles.seasonalSubtitle}>
                {events.map(e => e.icon + " " + e.name).join(" • ")}
              </Text>
            )}
          </View>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsScroll}
        >
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => {
                // Khi nhấn vào hành động, tạo chat mới với chủ đề này
                createNewChat({
                  id: `action-${index}`,
                  title: action.title,
                  icon: action.icon,
                  description: action.description
                });
              }}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.actionTitle} numberOfLines={1}>
                {action.title}
              </Text>
              <Text style={styles.actionDescription} numberOfLines={2}>
                {action.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

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
          ListFooterComponent={SeasonalActionsFooter}
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

  // Seasonal Actions Styles
  seasonalContainer: {
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  seasonalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  seasonalHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  seasonalTitle: {
    ...typography.h3,
    fontWeight: "700",
    color: "#0A0A0A",
    fontSize: 18,
  },
  seasonalSubtitle: {
    ...typography.body,
    color: "#666",
    fontSize: 13,
    marginTop: 2,
  },
  actionsScroll: {
    paddingRight: 16,
  },
  actionCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    ...typography.h3,
    fontWeight: "600",
    color: "#0A0A0A",
    fontSize: 15,
    marginBottom: 6,
  },
  actionDescription: {
    ...typography.body,
    color: "#666",
    fontSize: 12,
    lineHeight: 16,
  },
});

export default ChatBot;