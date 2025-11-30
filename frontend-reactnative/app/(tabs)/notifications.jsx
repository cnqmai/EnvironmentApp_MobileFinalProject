import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router"; 
import typography from "../../styles/typography";

// Services
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../src/services/notificationService";
import { getToken } from "../../src/utils/apiHelper";

const NotificationsScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); 
  const params = useLocalSearchParams(); // Dùng để bắt refresh từ TabsLayout

  const fetchNotifications = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Effect để load dữ liệu ban đầu và khi quay lại màn hình
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, params.refreshStamp]); // Thêm params.refreshStamp để bắt update từ TabsLayout

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // --- HÀM MARK ALL READ ---
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      
      // Kích hoạt refresh Badge count ở TabsLayout
      router.setParams({ refreshStamp: Date.now().toString() }); 
      
    } catch (e) { 
      console.error(e); 
    }
  };

  // --- HÀM PRESS ITEM ---
  const handlePressItem = async (item) => {
    if (item.status === 'UNREAD') {
      try {
        await markNotificationAsRead(item.id);
        setNotifications(prev => 
          prev.map(n => n.id === item.id ? {...n, status: 'READ'} : n)
        );
        // Kích hoạt refresh Badge count ở TabsLayout
        router.setParams({ refreshStamp: Date.now().toString() }); 

      } catch(e) { console.error(e); }
    }
    
    // Điều hướng dựa trên loại thông báo
    if (item.type === 'REPORT_STATUS') {
        router.push(`/reports/${item.relatedId}`); 
    }
  };

  // CẤU HÌNH ICON KHỚP VỚI ENUM BACKEND (Giữ nguyên)
  const getIconConfig = (type) => {
    switch (type) {
      case 'COLLECTION_REMINDER': return { icon: 'bell-ring-outline', bg: '#FFF3E0', color: '#FF7043' };
      case 'BADGE_EARNED': return { icon: 'trophy-variant-outline', bg: '#FFF9C4', color: '#FBC02D' };
      case 'CAMPAIGN': return { icon: 'bullhorn-outline', bg: '#F3E5F5', color: '#8E24AA' };
      case 'AQI_ALERT': case 'WEATHER_ALERT': return { icon: 'weather-cloudy-alert', bg: '#FFEBEE', color: '#F44336' };
      case 'REPORT_STATUS': return { icon: 'file-document-check-outline', bg: '#E3F2FD', color: '#2196F3' };
      default: return { icon: 'star-outline', bg: '#E8F5F9', color: '#00E676' };
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMinutes = Math.floor((now - date) / 60000);
    
    if (diffMinutes < 1) return "Vừa xong";
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${Math.floor(diffHours / 24)} ngày trước`;
  };

  const displayedList = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.status === 'UNREAD');

  const renderItem = ({ item }) => {
    const config = getIconConfig(item.type);
    const isUnread = item.status === 'UNREAD';

    return (
      <TouchableOpacity 
        style={[styles.card, isUnread && styles.unreadCard]}
        onPress={() => handlePressItem(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
          <MaterialCommunityIcons name={config.icon} size={26} color={config.color} />
        </View>
        <View style={styles.contentBox}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        {isUnread && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <View style={{flex:1}} />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>Thông báo</Text>
        <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
          <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
      {/* Chip TẤT CẢ */}
        <TouchableOpacity 
          style={[styles.chip, filter === 'all' && styles.activeChip]} 
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.chipText, filter === 'all' && styles.activeChipText]}>Tất cả</Text>
        </TouchableOpacity>
                
      {/* Chip CHƯA ĐỌC */}
        <TouchableOpacity 
          style={[styles.chip, filter === 'unread' && styles.activeChip]} 
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.chipText, filter === 'unread' && styles.activeChipText]}>Chưa đọc</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator color="#00C853" size="large"/></View>
      ) : (
        <FlatList
          data={displayedList}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 40, color: '#999'}}>Không có thông báo nào</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 15, marginBottom: 15 },
  screenTitle: { fontSize: 28, fontWeight: "bold", color: "#000" },
  markReadBtn: { backgroundColor: '#00C853', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  markReadText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  
  chip: { 
        paddingHorizontal: 20, 
        paddingVertical: 8, 
        borderRadius: 20, // Bo tròn hơn để đẹp hơn
        borderWidth: 1.5, // Tăng độ dày viền
        borderColor: '#00C853', // Viền xanh lá
        marginRight: 10, 
        backgroundColor: '#FFF' // Nền trắng mặc định
    },
    
    // STYLE KHI CHIP ĐƯỢC CHỌN (ACTIVE)
    activeChip: { 
        backgroundColor: '#00C853', // Nền xanh lá khi active
        borderColor: '#00C853', // Viền xanh lá
    },
    
    // STYLE TEXT
    chipText: { 
        color: '#000', 
        fontWeight: '600' 
    },
    activeChipText: { 
        color: '#FFF', // Chữ trắng khi active
    },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  unreadCard: { backgroundColor: '#F0FDF4' },
  
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contentBox: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  message: { fontSize: 14, color: '#444', marginBottom: 6, lineHeight: 20 },
  time: { fontSize: 12, color: '#999' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C853', position: 'absolute', top: 16, right: 16 }
});

export default NotificationsScreen;