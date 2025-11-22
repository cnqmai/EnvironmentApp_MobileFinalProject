import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import typography from "../../styles/typography";

// Services
import { getMyNotifications, markNotificationAsRead } from "../../src/services/notificationService";
import { getToken } from "../../src/utils/apiHelper";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      
      setIsLoggedIn(true);
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handlePressNotification = async (item) => {
    if (!item.read) {
      try {
        await markNotificationAsRead(item.id);
        // Cập nhật UI local
        setNotifications(prev => 
          prev.map(n => n.id === item.id ? {...n, read: true} : n)
        );
      } catch (e) {
        console.error("Failed to mark read:", e);
      }
    }
    // Logic điều hướng tùy vào loại thông báo (ví dụ: AQI, Report, Reward)
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => handlePressNotification(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={item.type === 'AQI_ALERT' ? "weather-fog" : "bell-outline"} 
          size={24} 
          color="#4CAF50" 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      {!item.read && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.content}>
      <MaterialCommunityIcons
        name={isLoggedIn ? "bell-sleep" : "account-lock"}
        size={64}
        color="#C7C7CC"
      />
      <Text style={styles.emptyTitle}>
        {isLoggedIn ? "Không có thông báo" : "Chưa đăng nhập"}
      </Text>
      <Text style={styles.emptyText}>
        {isLoggedIn 
          ? "Bạn chưa có thông báo nào mới" 
          : "Vui lòng đăng nhập để xem thông báo"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={EmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: "#F0EFED",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A0A0A",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    ...typography.body,
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  unreadItem: {
    backgroundColor: '#F1F8E9', // Light green tint
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notifTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#0A0A0A',
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: '#999',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  }
});

export default NotificationsScreen;