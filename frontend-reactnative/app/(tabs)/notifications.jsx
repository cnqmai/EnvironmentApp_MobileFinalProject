import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import typography from "../../styles/typography";
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../src/services/notificationService";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'AQI_ALERT': return 'alert-circle';
      case 'REPORT_STATUS': return 'file-document';
      case 'CAMPAIGN': return 'bullhorn';
      case 'COMMUNITY': return 'account-group';
      default: return 'bell';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
            <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && notifications.length === 0 ? (
          <View style={styles.content}>
            <Text style={styles.emptyText}>Đang tải...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.content}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={64}
              color="#C7C7CC"
            />
            <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
            <Text style={styles.emptyText}>
              Thông báo mới sẽ xuất hiện ở đây
            </Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notificationCard, !notif.isRead && styles.unreadCard]}
              onPress={() => handleMarkAsRead(notif.id)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationIcon}>
                <MaterialCommunityIcons
                  name={getNotificationIcon(notif.type)}
                  size={24}
                  color={notif.isRead ? "#8E8E93" : "#007AFF"}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, !notif.isRead && styles.unreadTitle]}>
                  {notif.title || "Thông báo"}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notif.message || notif.content || ""}
                </Text>
                <Text style={styles.notificationTime}>
                  {notif.createdAt ? new Date(notif.createdAt).toLocaleString('vi-VN') : ""}
                </Text>
              </View>
              {!notif.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
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
  markAllText: {
    ...typography.body,
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  unreadCard: {
    backgroundColor: "#F0F7FF",
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  notificationIcon: {
    marginRight: 12,
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: "800",
  },
  notificationMessage: {
    ...typography.body,
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    ...typography.small,
    fontSize: 12,
    color: "#8E8E93",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginLeft: 8,
    alignSelf: "center",
  },
});

export default NotificationsScreen;
