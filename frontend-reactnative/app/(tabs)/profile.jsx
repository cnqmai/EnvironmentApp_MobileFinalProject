import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import typography from "../../styles/typography";

// Services
import { getMyProfile, getMyStatistics } from "../../src/services/userService";
import { getToken, removeToken } from "../../src/utils/apiHelper";

const ProfileScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  // Đã sửa lại stats.points thành stats.currentPoints để khớp với API (UserStatisticsResponse)
  const [stats, setStats] = useState({ reportsCount: 0, questionsCount: 0, currentPoints: 0 }); 
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const params = useLocalSearchParams();

  // Hàm fetch dữ liệu user
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      // Gọi song song 2 API
      const [profile, statistics] = await Promise.all([
        getMyProfile().catch(e => null),
        getMyStatistics().catch(e => null)
      ]);

      if (profile) {
        setIsLoggedIn(true);
        setUserData(profile);
      } else {
        setIsLoggedIn(false); // Token hết hạn hoặc lỗi
      }

      if (statistics) {
        setStats({
          reportsCount: statistics.totalReports || 0,
          questionsCount: statistics.totalChatMessages || 0,
          currentPoints: statistics.currentPoints || 0 // Đã sửa tên biến
        });
      }

    } catch (error) {
      console.error("Profile Error:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Load lại dữ liệu mỗi khi màn hình được focus (để cập nhật điểm sau khi làm nhiệm vụ)
  useFocusEffect(
    useCallback(() => {
      if (params.logout === "true") {
        handleLogout();
      } else {
        fetchUserProfile();
      }
    }, [params.logout])
  );

  const handleLogout = async () => {
    await removeToken();
    setIsLoggedIn(false);
    setUserData(null);
    setMenuVisible(false);
    router.replace("/login"); 
  };

  const MenuItem = ({ icon, title, onPress, color }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        onPress?.();
      }}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={icon} size={20} color={color || "#0A0A0A"} />
      <Text style={[styles.menuItemText, color && { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  // --- UI CHẾ ĐỘ CHƯA ĐĂNG NHẬP (GIỮ NGUYÊN) ---
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.guestHeader}>
            <View style={styles.guestAvatarContainer}>
              <MaterialCommunityIcons name="account-circle-outline" size={56} color="#666" />
            </View>
            <Text style={styles.guestTitle}>Chưa đăng nhập</Text>
          </View>
          <View style={styles.loginPromptCard}>
            <Text style={styles.loginPromptTitle}>Đăng nhập để trải nghiệm đầy đủ</Text>
             <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- UI CHẾ ĐỘ ĐÃ ĐĂNG NHẬP (CẬP NHẬT) ---
  const MAX_XP_FOR_LEVEL = 300; 
  const progressPercentage = (stats.currentPoints / MAX_XP_FOR_LEVEL) * 100;
  const progressBarWidth = `${Math.min(progressPercentage, 100)}%`;


  return (
    <>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.menuButton}
              activeOpacity={0.7}
              onPress={() => setMenuVisible(!menuVisible)}
            >
              <MaterialCommunityIcons
                name={menuVisible ? "close" : "dots-horizontal"}
                size={24}
                color="#0A0A0A"
              />
            </TouchableOpacity>
          </View>

          {/* KHỐI CHÍNH: AVATAR & TÊN (Nằm độc lập) */}
          <View style={styles.avatarBlock}>
            <View style={styles.avatarContainer}>
              {userData?.avatarUrl ? (
                  // Dùng Image nếu có avatar URL
                  <Image source={{ uri: userData.avatarUrl }} style={styles.avatarImage} /> 
              ) : (
                  // Dùng icon tạm thời giống ảnh mẫu
                  <Text style={styles.defaultAvatarText}>:-)</Text>
              )}
            </View>
            <Text style={styles.userName}>{userData?.fullName || "Người dùng"}</Text>
          </View>

          {/* CARD THÔNG TIN LIÊN HỆ (Bố cục mới) */}
          <View style={styles.infoCard}>
            
            {/* HÀNG 1: Email và Phone Number */}
            <View style={styles.infoRow}>
              {/* Email (Áp dụng style mới: emailItem) */}
              <View style={[styles.infoItem, styles.emailItem]}>
                <MaterialCommunityIcons name="email-outline" size={18} color="#666" />
                <Text style={styles.infoText}>{userData?.email}</Text>
              </View>
              {/* Phone Number (Áp dụng style mới: phoneItem) */}
              <View style={[styles.infoItem, styles.phoneItem]}>
                <MaterialCommunityIcons name="phone-outline" size={18} color="#666" />
                <Text style={styles.infoText}>{userData?.phoneNumber || "0123456789"}</Text>
              </View>
            </View>
            
            {/* HÀNG 2: Location (Giữ nguyên) */}
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#666" />
              <Text style={styles.infoText}>{userData?.defaultLocation || "Thành phố Hồ Chí Minh"}</Text>
            </View>

          </View>

          {/* CARD CHIẾN BINH XANH (ĐÃ SỬA BỐ CỤC) */}
          <View style={styles.greenWarriorCard}>
            
            {/* TIÊU ĐỀ KHÔNG CÓ ICON */}
            <Text style={styles.greenWarriorTitleOnly}>CHIẾN BINH XANH</Text>
            
            {/* KHỐI ĐIỂM VÀ THANH TIẾN ĐỘ */}
            <View style={styles.xpBlockContainer}>
                
                {/* 1. Icon Hoa Tulip bên trái */}
                <MaterialCommunityIcons name="flower-tulip-outline" size={32} color="#4CAF50" style={styles.tulipIcon} />

                {/* 2. Cụm Điểm và Thanh Tiến độ */}
                <View style={styles.progressDetailBlock}>
                    {/* Dòng 1: Label Điểm xanh và XP Value */}
                    <View style={styles.pointsLabelRow}>
                        <Text style={styles.pointsLabel}>Điểm xanh</Text>
                        <Text style={styles.pointsValue}>{stats.currentPoints} / {MAX_XP_FOR_LEVEL}xp</Text>
                    </View>
                    
                    {/* Dòng 2: Thanh tiến độ */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarFill, { width: progressBarWidth }]} /> 
                        </View>
                    </View>
                </View>
            </View>

             <TouchableOpacity style={styles.learnMoreButton}>
               <Text style={styles.learnMoreText}>Tìm hiểu thêm về </Text>
               <Text style={styles.learnMoreBold}>Huy hiệu xanh</Text>
               <MaterialCommunityIcons name="chevron-right" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {/* CARD THỐNG KÊ */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="file-document-outline" size={32} color="#0A0A0A" />
              <Text style={styles.statText}>{stats.reportsCount} báo cáo đã gửi</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialCommunityIcons name="message-text-outline" size={32} color="#0A0A0A" />
              <Text style={styles.statText}>{stats.questionsCount} câu hỏi chatbot</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* DROPDOWN MENU */}
      {menuVisible && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <View style={styles.dropdownMenu}>
            <MenuItem
              icon="pencil-outline"
              title="Chỉnh sửa"
              onPress={() => {
                setMenuVisible(false);
                router.push("/edit-profile");
              }}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="logout"
              title="Đăng xuất"
              color="#D32F2F"
              onPress={handleLogout}
            />
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#F0EFED",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: "flex-end",
    position: "relative",
    zIndex: 1000,
  },
  menuButton: {
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownMenu: {
    position: "absolute",
    top: 110,
    right: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 180,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  menuItemText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 12,
  },
  // --- 1. KHỐI AVATAR VÀ TÊN ---
  avatarBlock: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  avatarContainer: {
    width: 120, 
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF", // Nền trắng
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20, 
    elevation: 5, // Độ nổi
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  defaultAvatarText: { // Style cho ":-)"
      fontSize: 32,
      color: "#666",
      fontWeight: 'bold',
  },
  avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 60,
  },
  userName: {
    ...typography.h2,
    fontSize: 24, 
    fontWeight: "800",
    color: "#0A0A0A",
    marginBottom: 0, 
    letterSpacing: -0.5,
  },

  // --- 2. CARD THÔNG TIN LIÊN HỆ ---
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20, 
    borderRadius: 24,
    paddingVertical: 16, 
    paddingHorizontal: 6, 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  infoRow: {
    flexDirection: "row",
    width: '100%',
    paddingVertical: 2, 
    marginBottom: 2, // Khoảng cách với dòng Location
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15, 
  },
  emailItem: {
    flex: 0.4,
    minWidth: 150,
  },
  phoneItem: {
    flex: 0.6,
  },
  infoText: { 
    ...typography.body,
    fontSize: 12,
    color: "#000000",
    fontWeight: "500",
    marginLeft: 6,
    flexShrink: 1, 
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", 
    paddingVertical: 4,
    paddingHorizontal: 15,
  },
  // --- 3. CARD CHIẾN BINH XANH ---
  greenWarriorCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  greenWarriorTitleOnly: { // MỚI: Tiêu đề không có icon
    ...typography.h3,
    fontSize: 18, 
    fontWeight: "800",
    color: "#0A0A0A",
    marginBottom: 16, 
    letterSpacing: -0.3,
  },
  // KHỐI CHÍNH: ICON + ĐIỂM/TIẾN ĐỘ
  xpBlockContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tulipIcon: { // Icon hoa tulip
    marginRight: 10,
    marginTop: 2, 
  },
  progressDetailBlock: { // KHỐI CHI TIẾT (Điểm + Tiến độ)
    flex: 1, 
  },
  pointsLabelRow: { // Dòng 1: Label Điểm xanh và XP Value
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "flex-end", 
    marginBottom: 4,
  },
  pointsLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  pointsValue: {
    ...typography.italic,
    fontSize: 14,
    fontWeight: "500", 
    color: "#000000", 
  },
  progressBarContainer: {
    marginBottom: 4, 
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8, 
  },
  learnMoreText: {
    ...typography.small,
    fontSize: 12,
    color: "#000000",
    fontWeight: "500",
  },
  learnMoreBold: {
    ...typography.small,
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "800",
  },
  // --- 4. CARD THỐNG KÊ ---
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "600",
    color: "#0A0A0A",
    textAlign: "center",
    marginTop: 12,
    letterSpacing: -0.2,
  },
  // --- GUEST MODE (Giữ nguyên) ---
  guestHeader: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  guestAvatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#E0E0E0",
  },
  guestTitle: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: "700",
    color: "#666",
    fontStyle: "italic",
    letterSpacing: -0.3,
  },
  loginPromptCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  loginPromptTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    borderRadius: 45,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
});

export default ProfileScreen;