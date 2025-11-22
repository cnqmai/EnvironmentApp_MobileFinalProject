import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
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
  const [stats, setStats] = useState({ reportsCount: 0, questionsCount: 0, points: 0 });
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
          points: statistics.currentPoints || 0
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
            {/* ... Giữ nguyên phần UI giới thiệu tính năng ... */}
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

          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              {userData?.avatarUrl ? (
                  // Nếu có ảnh avatar từ API thì dùng Image, tạm thời dùng icon
                  <MaterialCommunityIcons name="account" size={56} color="#0a0a0aff" />
              ) : (
                  <MaterialCommunityIcons name="emoticon-happy-outline" size={56} color="#0a0a0aff" />
              )}
            </View>
            <Text style={styles.userName}>{userData?.fullName || "Người dùng"}</Text>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{userData?.email}</Text>
            </View>
             {/* Các field khác nếu có trong API */}
          </View>

          <View style={styles.greenWarriorCard}>
            <View style={styles.greenWarriorHeader}>
              <MaterialCommunityIcons name="leaf" size={24} color="#4CAF50" />
              <Text style={styles.greenWarriorTitle}>THÀNH TÍCH XANH</Text>
            </View>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Điểm hiện tại</Text>
              <Text style={styles.pointsValue}>{stats.points} điểm</Text>
            </View>
            
            {/* Thanh tiến độ có thể tính toán dựa trên level nếu API trả về */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: "50%" }]} /> 
              </View>
            </View>
          </View>

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

// Giữ nguyên styles...
const styles = StyleSheet.create({
  // ... copy styles cũ vào đây
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
  userCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#F0EFED",
  },
  userName: {
    ...typography.h2,
    fontSize: 28,
    fontWeight: "800",
    color: "#0A0A0A",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    width: "100%",
    paddingHorizontal: 8,
  },
  infoText: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginLeft: 8,
  },
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
  greenWarriorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  greenWarriorTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "800",
    color: "#0A0A0A",
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pointsLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  pointsValue: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  progressBarContainer: {
    marginBottom: 12,
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
  },
  learnMoreText: {
    ...typography.small,
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  learnMoreBold: {
    ...typography.small,
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "700",
  },
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
  locationCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
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
  featureList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "500",
    color: "#0A0A0A",
    marginLeft: 12,
    letterSpacing: -0.1,
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