import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react"; // Thêm useEffect, useCallback
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  ActivityIndicator, // Thêm ActivityIndicator
  Alert, // Thêm Alert
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

// *** IMPORT CÁC HÀM API VÀ SERVICE (Đã xác nhận file userService.js) ***
import { getPrivacySettings, updatePrivacySettings } from '../../src/services/userService'; 


const PrivacySettingScreen = () => {
  const router = useRouter();
  
  // SỬ DỤNG CÁC STATE PHÙ HỢP VỚI API BACKEND (sharePersonalData, shareLocation)
  const [sharePersonalData, setSharePersonalData] = useState(false); 
  const [shareLocation, setShareLocation] = useState(false);
  // encryptData là thông tin hiển thị tĩnh (FR-7.1), không cần state động cho nó.
  
  const [loading, setLoading] = useState(true);

  // 1. Tải cài đặt hiện tại khi màn hình khởi tạo
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settings = await getPrivacySettings(); 

        // Nếu API trả về { share_location: true, share_personal_data: false } thì code mới sau đây đúng:
        setSharePersonalData(settings.sharePersonalData || settings.share_personal_data);
        setShareLocation(settings.shareLocation || settings.share_location);
        
      } catch (error) {
        console.error("Lỗi tải cài đặt Quyền riêng tư:", error);
        Alert.alert("Lỗi", "Không thể tải cài đặt. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Hàm xử lý cập nhật API
  const handleUpdateSetting = useCallback(async (key, value) => {
    const updateState = key === 'shareLocation' ? setShareLocation : setSharePersonalData;
    const requestBody = key === 'shareLocation' 
        ? { share_location: value } 
        : { share_personal_data: value };

    try {
        await updatePrivacySettings(requestBody); 
    } catch (error) {
        console.error(`Lỗi cập nhật ${key}:`, error);
        Alert.alert("Lỗi", "Cập nhật thất bại. Vui lòng kiểm tra kết nối.");
        // Revert lại trạng thái switch nếu thất bại
        updateState(!value); 
    }
  }, []);

  const handleSharePersonalDataToggle = (value) => {
    // Cập nhật trạng thái cục bộ ngay lập tức để UX tốt hơn
    setSharePersonalData(value); 
    // Gọi API cập nhật
    handleUpdateSetting('sharePersonalData', value);
  };

  const handleShareLocationToggle = (value) => {
    // Cập nhật trạng thái cục bộ ngay lập tức để UX tốt hơn
    setShareLocation(value);
    // Gọi API cập nhật
    handleUpdateSetting('shareLocation', value);
  };
  
  // Hiển thị Loading Overlay
  if (loading) {
      return (
          <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={["top"]}>
              <ActivityIndicator size="large" color="#00C853" />
              <Text style={{ marginTop: 10 }}>Đang tải cài đặt...</Text>
          </SafeAreaView>
      );
  }


  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#0A0A0A"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quyền riêng tư & Bảo mật</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Mã hóa dữ liệu</Text>
            <Text style={styles.settingDescription}>
              Tất cả dữ liệu của nhân của bạn được mã hóa để đảm bảo an toàn.
            </Text>
          </View>

          {/* Mục: Chia sẻ dữ liệu cá nhân (FR-7.3) - Dùng state sharePersonalData
          <View style={[styles.settingItem, styles.settingItemWithSwitch]}>
            <View style={styles.settingLeft}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Chia sẻ dữ liệu cá nhân</Text>
                <Text style={styles.settingSubtext}>
                  Ứng dụng sẽ không chia sẻ vị trí hoặc dữ liệu cá nhân của bạn
                  nếu chưa có sự đồng ý.
                </Text>
              </View>
            </View>
            <Switch
              // Dùng state sharePersonalData từ API
              value={sharePersonalData} 
              onValueChange={handleSharePersonalDataToggle}
              trackColor={{ false: "#E0E0E0", true: "#34C759" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
            />
          </View> */}

          {/* Mục: Chia sẻ vị trí (FR-7.3) - Dùng state shareLocation */}
          <View
            style={[
              styles.settingItem,
              styles.settingItemWithSwitch,
              styles.settingItemLast,
            ]}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Chia sẻ vị trí</Text>
                 <Text style={styles.settingSubtext}>
                  Ứng dụng sẽ không chia sẻ vị trí hoặc dữ liệu cá nhân của bạn
                  nếu chưa có sự đồng ý.
                </Text>
              </View>
            </View>
            <Switch
              // Dùng state shareLocation từ API
              value={shareLocation}
              onValueChange={handleShareLocationToggle}
              trackColor={{ false: "#E0E0E0", true: "#34C759" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          {/* Liên kết: Chính sách & Điều khoản */}
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => router.push("/settings/policy")}
            activeOpacity={0.7}
          >
            <Text style={styles.navigationText}>Chính sách & Điều khoản</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#0A0A0A"
            />
          </TouchableOpacity>

          {/* Liên kết: Xóa tài khoản & dữ liệu (FR-7.2) */}
          <TouchableOpacity
            style={[styles.navigationItem, styles.navigationItemLast]}
            onPress={() => router.push("/settings/delete-account")}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteText}>Xóa tài khoản & dữ liệu</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#FF3B30"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0EFED",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 44,
  },

  settingsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFED",
  },
  settingItemWithSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingTitle: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  settingDescription: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  settingLeft: {
    flex: 1,
    paddingRight: 12,
  },
  settingContent: {},
  settingLabel: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 6,
  },
  settingSubtext: {
    ...typography.small,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  navigationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0EFED",
  },
  navigationItemLast: {
    paddingBottom: 16,
  },
  navigationText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "500",
    color: "#0A0A0A",
  },
  deleteText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#FF3B30",
  },
});

export default PrivacySettingScreen;