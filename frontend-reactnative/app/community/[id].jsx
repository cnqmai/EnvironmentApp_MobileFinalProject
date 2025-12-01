import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  Alert,
  Image, // Import Image
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";
import { fetchCommunityDetails, toggleJoinCommunity } from '../../src/services/communityService';
import { useFocusEffect } from "expo-router";

const CommunityDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Group ID (UUID string)
  
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- LOGIC LẤY DỮ LIỆU ---
  const loadCommunityDetails = useCallback(async () => {
      if (!id) return;

      setLoading(true);
      try {
          // Dữ liệu trả về giờ bao gồm: areaName, totalReports, recycledWasteKg, imageUrl
          const data = await fetchCommunityDetails(id); 
          setCommunity(data);
      } catch (e) {
          console.error("Lỗi tải chi tiết nhóm:", e.response?.data || e.message);
          Alert.alert("Lỗi", "Không thể tải thông tin cộng đồng.");
          setCommunity(null);
      } finally {
          setLoading(false);
      }
  }, [id]);

  useFocusEffect(loadCommunityDetails);

  // --- LOGIC THAM GIA/RỜI NHÓM ---
  const handleJoinToggle = async () => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
        const updatedCommunity = await toggleJoinCommunity(id);
        setCommunity(updatedCommunity);
        Alert.alert("Thành công", updatedCommunity.isMember ? "Bạn đã tham gia nhóm!" : "Bạn đã rời khỏi nhóm.");
    } catch (e) {
        console.error("Lỗi tham gia/rời nhóm:", e.response?.data || e.message);
        Alert.alert("Lỗi", "Thao tác không thành công.");
    } finally {
        setActionLoading(false);
    }
  };

  if (loading || community === null) {
      return (
          <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={["top"]}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={{ marginTop: 10, color: '#666' }}>Đang tải chi tiết cộng đồng...</Text>
          </SafeAreaView>
      );
  }
  
  const isJoined = community.isMember;
  const isFollowing = isJoined; 
  
  // Lấy dữ liệu động mới từ API response
  const { 
    areaName, 
    totalReports, 
    recycledWasteKg, 
    imageUrl 
  } = community;

  // Định dạng số (làm tròn kg và thêm dấu phẩy)
  const formattedRecycledWaste = recycledWasteKg ? Math.round(recycledWasteKg).toLocaleString('vi-VN') : '0';
  const formattedTotalReports = totalReports ? totalReports.toLocaleString('vi-VN') : '0';

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/community")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#0A0A0A"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cộng đồng</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.communityInfo}>
          {/* LOGIC HIỂN THỊ ẢNH ĐẠI DIỆN */}
          {imageUrl ? (
            <Image 
                source={{ uri: imageUrl }} 
                style={styles.communityAvatar} // Style mới
            />
          ) : (
            <View style={styles.communityIconContainer}>
              <MaterialCommunityIcons
                name="shield-check"
                size={56}
                color="#FFFFFF"
              />
            </View>
          )}
          {/* KẾT THÚC LOGIC ẢNH */}

          <View style={styles.communityTextInfo}>
            <Text style={styles.communityName}>{community.name}</Text>
            
            {/* HIỂN THỊ KHU VỰC HOẠT ĐỘNG */}
            {areaName && (
              <Text style={styles.communityLocationText}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#666" /> 
                {' '}Khu vực: {areaName}
              </Text>
            )}

            <Text style={styles.communityMembers}>
              {community.memberCount} thành viên
            </Text>
          </View>
        </View>

        <View style={styles.communityDescription}>
          <Text style={styles.descriptionText}>
            {"Giới thiệu về nhóm: \n" + community.description || "Cộng đồng hoạt động vì môi trường xanh, sạch, bền vững"}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isJoined && styles.primaryButtonActive,
            ]}
            onPress={handleJoinToggle}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            {actionLoading ? (
                <ActivityIndicator size="small" color={isJoined ? "#007AFF" : "#FFFFFF"} />
            ) : (
                <>
                    <MaterialCommunityIcons
                        name={isJoined ? "account-check" : "account-plus"}
                        size={20}
                        color={isJoined ? "#007AFF" : "#FFFFFF"}
                    />
                    <Text
                        style={[
                            styles.primaryButtonText,
                            isJoined && styles.primaryButtonTextActive,
                        ]}
                    >
                        {isJoined ? "Đã tham gia" : "Tham gia"}
                    </Text>
                </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              isFollowing && styles.secondaryButtonActive,
            ]}
            onPress={() => { Alert.alert("Tính năng chưa có", "Tính năng theo dõi sẽ sớm được cập nhật."); }} // Mock: Giữ nguyên logic UI
            disabled={!isJoined || actionLoading}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isFollowing ? "bell" : "bell-outline"}
              size={20}
              color={isFollowing ? "#007AFF" : "#666"}
            />
            <Text
              style={[
                styles.secondaryButtonText,
                isFollowing && styles.secondaryButtonTextActive,
              ]}
            >
              {isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Phần thống kê (Giữ nguyên Mock data, thay memberCount) */}
        <View style={styles.secondRowButtons}>
          <TouchableOpacity
            style={styles.eventButton}
            onPress={() => router.push(`/community/${id}/events`)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="calendar-star"
              size={20}
              color="#007AFF"
            />
            <Text style={styles.eventButtonText}>Xem sự kiện</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Thống kê cộng đồng</Text>

          <View style={styles.mainStatsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{community.memberCount}</Text>
                <Text style={styles.statLabel}>Thành viên</Text>
              </View>
              <View style={styles.statItem}>
                {/* Dùng Mock data vì API chưa có */}
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Chiến dịch</Text>
              </View>
              <View style={styles.statItem}>
                {/* [CẬP NHẬT] Dùng dữ liệu động từ API */}
                <Text style={styles.statValue}>
                  {formattedRecycledWaste}kg
                </Text>
                <Text style={styles.statLabel}>Lượng rác{"\n"}tái chế</Text>
              </View>
            </View>
          </View>

          <View style={styles.twoCardsRow}>
            <View style={styles.smallCard}>
              <MaterialCommunityIcons
                name="file-document"
                size={28}
                color="#0A0A0A"
              />
              {/* [CẬP NHẬT] Dùng dữ liệu động từ API */}
              <Text style={styles.smallCardValue}>
                {formattedTotalReports} báo cáo{"\n"}đã gửi
              </Text>
            </View>

            <View style={styles.smallCard}>
              <MaterialCommunityIcons
                name="account-group"
                size={28}
                color="#0A0A0A"
              />
              {/* Dùng Mock data */}
              <Text style={styles.smallCardValue}>
                2345 người{"\n"}tham gia
              </Text>
            </View>
          </View>
          
          {/* ... (Phần Chart và Badge giữ nguyên Mock UI) ... */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Hoạt động cộng đồng</Text>
              <Text style={styles.chartDate}>Năm 2025</Text>
            </View>

            <View style={styles.chartLegendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#E3F2FD" }]}
                />
                <Text style={styles.legendText}>Trung bình</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#007AFF" }]}
                />
                <Text style={styles.legendText}>Tháng này (11)</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartScrollContent}
            >
              <View style={styles.chartBarsContainer}>
                {Array.from({ length: 11 }, (_, i) => {
                  const month = i + 1;
                  const isCurrentMonth = month === 11;
                  const heights = [45, 38, 52, 48, 55, 50, 43, 58, 62, 70, 85];
                  const height = heights[i];

                  return (
                    <View key={month} style={styles.barGroup}>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            isCurrentMonth ? styles.barDark : styles.barLight,
                            { height: `${height}%` },
                          ]}
                        />
                        {isCurrentMonth && <View style={styles.chartDot} />}
                      </View>
                      <Text
                        style={[
                          styles.barLabel,
                          isCurrentMonth && styles.barLabelActive,
                        ]}
                      >
                        {month}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.badgeSection}>
          <Text style={styles.badgeSectionTitle}>Huy hiệu cộng đồng</Text>

          <View style={styles.badgeCardsRow}>
            <View style={styles.badgeCard}>
              <MaterialCommunityIcons
                name="shield-star"
                size={48}
                color="#FFFFFF"
              />
              <Text style={styles.badgeCardTitle}>
                Cộng đồng bảo vệ môi trường Cấp 2
              </Text>
              <Text style={styles.badgeCardSubtitle}>4000kg rác tái chế</Text>
            </View>

            <View style={styles.badgeCard}>
              <MaterialCommunityIcons
                name="shield-star"
                size={48}
                color="#FFFFFF"
              />
              <Text style={styles.badgeCardTitle}>Cộng đồng năng động</Text>
              <Text style={styles.badgeCardSubtitle}>10 chiến dịch</Text>
            </View>
          </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
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
  communityInfo: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: "#F0EFED",
  },
  
  // [CẬP NHẬT] Style mới cho Image
  communityAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: '#E5E5E5',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    resizeMode: 'cover',
  },
  // [GIỮ NGUYÊN] Style cũ cho icon (dùng khi không có ảnh)
  communityIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  communityTextInfo: {
    alignItems: "center",
  },
  communityName: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0A0A0A",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  // [MỚI] Style cho khu vực hoạt động
  communityLocationText: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  communityMembers: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },

  communityDescription: {
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 16,
  },
  descriptionText: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 20,
    color: "#666",
    textAlign: "center",
  },

  separator: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 24,
    marginVertical: 20,
  },

  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 13,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonActive: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1.5,
    borderColor: "#007AFF",
  },
  primaryButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  primaryButtonTextActive: {
    color: "#007AFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  secondaryButtonActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  secondaryButtonTextActive: {
    color: "#007AFF",
  },

  secondRowButtons: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  eventButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#007AFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  eventButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
  },

  statsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
  },
  statsSectionTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 20,
  },

  mainStatsCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 6,
  },
  statLabel: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },

  twoCardsRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  smallCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 8,
  },
  smallCardValue: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
    textAlign: "center",
  },

  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  sectionHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  chartSection: {
    backgroundColor: "#FFFFFF",
    marginBottom: 0,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  chartDate: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "500",
    color: "#999",
  },
  chartLegendRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.small,
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  chartScrollContent: {
    paddingRight: 20,
  },
  chartBarsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 140,
    gap: 8,
  },
  barGroup: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barContainer: {
    width: 32,
    height: 140,
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
    marginBottom: 8,
  },
  bar: {
    width: "100%",
    borderRadius: 6,
  },
  barLight: {
    backgroundColor: "#E3F2FD",
  },
  barDark: {
    backgroundColor: "#007AFF",
  },
  chartDot: {
    position: "absolute",
    top: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  barLabel: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "500",
    color: "#999",
    marginTop: 8,
  },
  barLabelActive: {
    fontWeight: "700",
    color: "#0A0A0A",
  },

  badgeSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  badgeSectionTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 20,
  },
  badgeCardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: "#A8D5FF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 12,
  },
  badgeCardTitle: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: "#0A0A0A",
    textAlign: "center",
  },
  badgeCardSubtitle: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "500",
    color: "#0A0A0A",
    textAlign: "center",
  },
});

export default CommunityDetailScreen;