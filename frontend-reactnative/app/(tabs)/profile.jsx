import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect, useNavigation } from "expo-router";
import typography from "../../styles/typography";

// Services
import { getMyProfile, getMyStatistics } from "../../src/services/userService";
import { getToken, removeToken } from "../../src/utils/apiHelper";

const ProfileScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ reportsCount: 0, questionsCount: 0, currentPoints: 0, classificationsCount: 0 }); 
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  // --- FIX: TẮT HEADER MẶC ĐỊNH CỦA TAB ---
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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

      const [profile, statistics] = await Promise.all([
        getMyProfile().catch(e => null),
        getMyStatistics().catch(e => null)
      ]);

      if (profile) {
        setIsLoggedIn(true);
        setUserData(profile);
      } else {
        setIsLoggedIn(false); 
      }

      if (statistics) {
        setStats({
          reportsCount: statistics.totalReports || 0,
          questionsCount: statistics.totalChatMessages || 0,
          currentPoints: statistics.currentPoints || 0,
          classificationsCount: statistics.wasteClassificationsCount || 0
        });
      }

    } catch (error) {
      console.error("Profile Error:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

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
      onPress={onPress}
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

  // --- UI CHẾ ĐỘ CHƯA ĐĂNG NHẬP ---
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
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- TÍNH TOÁN THANH XP ---
  const MAX_XP_FOR_LEVEL = 1000; 
  const progressPercentage = Math.min((stats.currentPoints / MAX_XP_FOR_LEVEL) * 100, 100);
  const progressBarWidth = `${progressPercentage}%`;
  
  let rankTitle = "Người Xanh";
  if (stats.currentPoints >= 1000) rankTitle = "Thành phố Sạch";
  else if (stats.currentPoints >= 500) rankTitle = "Chiến binh Môi trường";

  return (
    <>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.menuButton}
              activeOpacity={0.7}
              onPress={() => setMenuVisible(!menuVisible)}
            >
              <MaterialCommunityIcons name={menuVisible ? "close" : "dots-horizontal"} size={24} color="#0A0A0A" />
            </TouchableOpacity>
          </View>

          {/* AVATAR & TÊN */}
          <View style={styles.avatarBlock}>
            <View style={styles.avatarContainer}>
              {userData?.avatarUrl ? (
                  <Image source={{ uri: userData.avatarUrl }} style={styles.avatarImage} /> 
              ) : (
                  <Text style={styles.defaultAvatarText}>{userData?.fullName?.charAt(0) || ":-)"}</Text>
              )}
            </View>
            <Text style={styles.userName}>{userData?.fullName || "Người dùng"}</Text>
          </View>

          {/* THÔNG TIN LIÊN HỆ */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoItem, styles.emailItem]}>
                <MaterialCommunityIcons name="email-outline" size={18} color="#666" />
                <Text style={styles.infoText} numberOfLines={1}>{userData?.email}</Text>
              </View>
              <View style={[styles.infoItem, styles.phoneItem]}>
                <MaterialCommunityIcons name="phone-outline" size={18} color="#666" />
                <Text style={styles.infoText}>{userData?.phoneNumber || "SĐT: Trống"}</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#666" />
              <Text style={styles.infoText}>{userData?.defaultLocation || "Vị trí: Chưa cập nhật"}</Text>
            </View>
          </View>

          {/* CARD GAMIFICATION */}
          <View style={styles.greenWarriorCard}>
            <Text style={styles.greenWarriorTitleOnly}>{rankTitle.toUpperCase()}</Text>
            <View style={styles.xpBlockContainer}>
                <MaterialCommunityIcons name="medal" size={40} color="#FFD700" style={styles.tulipIcon} />
                <View style={styles.progressDetailBlock}>
                    <View style={styles.pointsLabelRow}>
                        <Text style={styles.pointsLabel}>Điểm xanh tích lũy</Text>
                        <Text style={styles.pointsValue}>{stats.currentPoints} xp</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarFill, { width: progressBarWidth }]} /> 
                        </View>
                    </View>
                </View>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                 <TouchableOpacity style={styles.gamificationBtn} onPress={() => router.push('/features/badges')}>
                    <MaterialCommunityIcons name="shield-star-outline" size={20} color="#4CAF50" />
                    <Text style={styles.gamificationBtnText}>Huy hiệu</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.gamificationBtn} onPress={() => router.push('/features/redeem-points')}>
                    <MaterialCommunityIcons name="gift-outline" size={20} color="#EF6C00" />
                    <Text style={[styles.gamificationBtnText, {color: '#EF6C00'}]}>Đổi quà</Text>
                 </TouchableOpacity>
            </View>
          </View>

          {/* CARD THỐNG KÊ */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => router.push('/reports')}>
              <MaterialCommunityIcons name="file-document-outline" size={32} color="#0A0A0A" />
              <Text style={styles.statText}>{stats.reportsCount} báo cáo</Text>
              <Text style={styles.linkText}>Xem lịch sử &rarr;</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => router.push('/chat/chatbot')}>
              <MaterialCommunityIcons name="message-text-outline" size={32} color="#0A0A0A" />
              <Text style={styles.statText}>{stats.questionsCount} câu hỏi</Text>
              <Text style={styles.linkText}>Lịch sử chat &rarr;</Text>
            </TouchableOpacity>
          </View>

          {/* CARD THỐNG KÊ PHÂN LOẠI RÁC */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => router.push('/(tabs)/recycle')}>
              <MaterialCommunityIcons name="recycle" size={32} color="#4CAF50" />
              <Text style={styles.statText}>{stats.classificationsCount} lần phân loại</Text>
              <Text style={styles.linkText}>Phân loại rác &rarr;</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* DROPDOWN MENU */}
      {menuVisible && (
        <>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMenuVisible(false)} />
          <View style={styles.dropdownMenu}>
            <MenuItem icon="pencil-outline" title="Chỉnh sửa hồ sơ" onPress={() => { setMenuVisible(false); router.push("/edit-profile"); }} />
            <MenuItem icon="cog-outline" title="Cài đặt thông báo" onPress={() => { setMenuVisible(false); router.push("/settings/notification-settings"); }} />
             <MenuItem icon="lock-outline" title="Riêng tư & Bảo mật" onPress={() => { setMenuVisible(false); router.push("/settings/privacy"); }} />
            <View style={styles.menuDivider} />
            <MenuItem icon="logout" title="Đăng xuất" color="#D32F2F" onPress={handleLogout} />
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFED" },
  scrollContent: { paddingBottom: 120, flexGrow: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, alignItems: "flex-end", zIndex: 1000 },
  menuButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", elevation: 2 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  dropdownMenu: { position: "absolute", top: 110, right: 24, backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 8, minWidth: 200, elevation: 8, zIndex: 1001 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  menuItemText: { ...typography.body, fontSize: 15, fontWeight: "600", color: "#0A0A0A", marginLeft: 12 },
  menuDivider: { height: 1, backgroundColor: "#F0F0F0", marginHorizontal: 12 },
  avatarBlock: { alignItems: 'center', marginBottom: 20 },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 15, elevation: 5 },
  defaultAvatarText: { fontSize: 40, color: "#666", fontWeight: 'bold' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 60 },
  userName: { ...typography.h2, fontSize: 22, fontWeight: "800", color: "#0A0A0A" },
  infoCard: { backgroundColor: "#FFFFFF", marginHorizontal: 20, marginBottom: 20, borderRadius: 20, padding: 16, elevation: 2 },
  infoRow: { flexDirection: "row", marginBottom: 10 },
  infoItem: { flexDirection: "row", alignItems: "center" },
  emailItem: { flex: 1, marginRight: 5 },
  phoneItem: { flex: 0.8 },
  infoText: { fontSize: 13, color: "#333", marginLeft: 6, flexShrink: 1 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  greenWarriorCard: { backgroundColor: "#FFFFFF", marginHorizontal: 20, marginBottom: 20, borderRadius: 20, padding: 20, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#4CAF50' },
  greenWarriorTitleOnly: { fontSize: 16, fontWeight: "900", color: "#2E7D32", marginBottom: 12, letterSpacing: 0.5 },
  xpBlockContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  tulipIcon: { marginRight: 15 },
  progressDetailBlock: { flex: 1 },
  pointsLabelRow: { flexDirection: "row", justifyContent: 'space-between', marginBottom: 5 },
  pointsLabel: { fontSize: 13, fontWeight: "600", color: "#555" },
  pointsValue: { fontSize: 13, fontWeight: "bold", color: "#4CAF50" },
  progressBarContainer: { height: 8, backgroundColor: "#F0F0F0", borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: "100%", backgroundColor: "#4CAF50", borderRadius: 4 },
  gamificationBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  gamificationBtnText: { marginLeft: 6, fontSize: 12, fontWeight: 'bold', color: '#4CAF50' },
  statsRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 20, gap: 12 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, alignItems: "center", elevation: 2 },
  statText: { fontSize: 13, fontWeight: "600", color: "#0A0A0A", marginTop: 10, marginBottom: 5 },
  linkText: { fontSize: 11, color: '#4CAF50', fontWeight: 'bold' },
  guestHeader: { alignItems: "center", paddingVertical: 40 },
  guestAvatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 1, borderColor: "#DDD" },
  guestTitle: { fontSize: 20, fontWeight: "700", color: "#666" },
  loginPromptCard: { backgroundColor: "#FFF", marginHorizontal: 20, borderRadius: 16, padding: 24, alignItems: 'center' },
  loginPromptTitle: { fontSize: 16, fontWeight: "600", marginBottom: 20 },
  loginButton: { backgroundColor: "#007AFF", borderRadius: 30, paddingVertical: 14, paddingHorizontal: 40 },
  loginButtonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});

export default ProfileScreen;