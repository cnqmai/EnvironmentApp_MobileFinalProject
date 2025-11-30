// TRONG FILE settings/notification-settings.jsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch, 
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

import { getNotificationSettings, updateNotificationSettings } from '../../src/services/userService'; 


const NotificationSettingsScreen = () => {
  const router = useRouter();
  
  // States cho tất cả các cờ boolean từ NotificationSettingsResponse
  const [settings, setSettings] = useState({
      aqiAlertEnabled: true,
      collectionReminderEnabled: true,
      campaignNotificationsEnabled: true,
      reportStatusNotificationsEnabled: true,
      badgeNotificationsEnabled: true,
  });
  
  const [loading, setLoading] = useState(true);

  // --- 1. TẢI CÀI ĐẶT HIỆN TẠI ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getNotificationSettings(); 
        
        // Gán giá trị chỉ khi chúng không phải null (mặc định là TRUE)
        setSettings({
            aqiThreshold: data.aqiThreshold || 100, // Giữ threshold để hiển thị trong nút
            aqiAlertEnabled: data.aqiAlertEnabled ?? true,
            collectionReminderEnabled: data.collectionReminderEnabled ?? true,
            campaignNotificationsEnabled: data.campaignNotificationsEnabled ?? true,
            reportStatusNotificationsEnabled: data.reportStatusNotificationsEnabled ?? true,
            badgeNotificationsEnabled: data.badgeNotificationsEnabled ?? true,
        });
      } catch (error) {
        console.error("Lỗi tải cài đặt thông báo:", error);
        Alert.alert("Lỗi", "Không thể tải cài đặt thông báo.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // --- HÀM XỬ LÝ CẬP NHẬT TỪ SWITCH ---
  const handleToggle = useCallback(async (key) => {
    // 1. Lấy giá trị mới và cập nhật local state
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));

    try {
      // 2. Gửi chỉ một cờ boolean lên backend (các cờ khác sẽ là null và backend sẽ bỏ qua)
      await updateNotificationSettings({
        [key]: newValue
      });
    } catch (error) {
      console.error(`Lỗi cập nhật cờ ${key}:`, error);
      Alert.alert("Lỗi", "Cập nhật thất bại. Vui lòng kiểm tra kết nối.");
      // 3. Revert lại trạng thái switch nếu thất bại
      setSettings(prev => ({ ...prev, [key]: !newValue })); 
    }
  }, [settings]);

  // Hàm helper để render một mục có Switch
  const renderSwitchItem = (label, key, icon, description) => (
      <View style={[styles.menuItem, styles.settingItemWithSwitch]} key={key}>
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons name={icon} size={22} color="#444" />
          <View style={styles.textContainer}>
            <Text style={styles.menuItemText}>{label}</Text>
            {description && <Text style={styles.statusText}>{description}</Text>}
          </View>
        </View>
        <Switch
          value={settings[key]}
          onValueChange={() => handleToggle(key)}
          trackColor={{ false: "#E0E0E0", true: "#34C759" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#E0E0E0"
        />
      </View>
  );

  // Hàm helper để render một mục Navigation
  const renderNavigationItem = (label, route, icon) => (
      <TouchableOpacity
        style={[styles.menuItem, styles.navigationItem]}
        onPress={() => router.push(route)}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons name={icon} size={22} color="#0A0A0A" />
          <Text style={styles.menuItemText}>{label}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>
  );

  if (loading) {
      return (
          <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={["top"]}>
              <ActivityIndicator size="large" color="#00C853" />
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#0A0A0A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài đặt Thông báo</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Cảnh báo AQI (FR-2.2.1/2)</Text>
          
          {/* NÚT ĐIỀU HƯỚNG CHỈNH NGƯỠNG AQI */}
          {renderNavigationItem(
              `Chỉnh Ngưỡng Cảnh báo (${settings.aqiThreshold})`, 
              "/settings/aqi-threshold", 
              "cog-outline"
          )}
          
          {/* SWITCH BẬT/TẮT CẢNH BÁO AQI */}
          {renderSwitchItem(
              "Bật/Tắt Cảnh báo AQI", 
              "aqiAlertEnabled", 
              "alert-outline",
              "Bật/Tắt hoàn toàn cảnh báo dựa trên ngưỡng."
          )}
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Thông báo Định kỳ & Sự kiện</Text>

          {/* Thu gom Rác (FR-6.2) */}
          {renderSwitchItem(
              "Nhắc nhở Thu gom Rác", 
              "collectionReminderEnabled", 
              "trash-can-outline", 
              "Thông báo lúc 7:00 sáng và 10:00 tối."
          )}

          {/* Thông báo Chiến dịch (FR-6.1) */}
          {renderSwitchItem(
              "Thông báo Chiến dịch/Sự kiện", 
              "campaignNotificationsEnabled", 
              "bullhorn-outline", 
              "Thông báo cuối tuần về các hoạt động môi trường."
          )}
          
          {/* Cập nhật Trạng thái Báo cáo */}
          {renderSwitchItem(
              "Cập nhật Trạng thái Báo cáo", 
              "reportStatusNotificationsEnabled", 
              "file-document-check-outline", 
              "Nhận thông báo khi báo cáo của bạn được xử lý."
          )}
          
          {/* Thông báo Huy hiệu/Điểm */}
          {renderSwitchItem(
              "Thông báo Huy hiệu & Điểm", 
              "badgeNotificationsEnabled", 
              "trophy-outline", 
              "Nhận thông báo khi bạn kiếm được điểm thưởng/huy hiệu mới."
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFED" },
  scrollContent: { paddingBottom: 40, flexGrow: 1, },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#0A0A0A", letterSpacing: -0.3, },
  placeholder: { width: 44, },
  
  menuSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#666',
      marginTop: 10,
      marginBottom: 5,
      textTransform: 'uppercase',
  },
  // Đã tối ưu các styles dưới đây
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFED",
  },
  settingItemWithSwitch: {
    paddingVertical: 18,
  },
  navigationItem: {
    paddingVertical: 18,
  },
  settingLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    flex: 1,
  },
  textContainer: { 
      marginLeft: 12, 
      flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  statusText: {
      fontSize: 13,
      color: '#666',
      lineHeight: 18,
  }
});

export default NotificationSettingsScreen;