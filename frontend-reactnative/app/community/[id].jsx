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
  Image,
  Dimensions, // Dùng để tính toán vị trí cố định của FAB
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";
import { fetchCommunityDetails, toggleJoinCommunity } from '../../src/services/communityService';
import { getMyReports } from '../../src/services/reportService'; 
// CẬP NHẬT: Import service xuất báo cáo mới
import { exportCommunityReport } from '../../src/services/reportService'; 
import { useFocusEffect } from "expo-router";

// ĐÃ XÓA HÀM MOCK exportReportToPDF

const windowWidth = Dimensions.get('window').width;

const CommunityDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Group ID (UUID string)
  
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false); // State cho nút Export

  // --- LOGIC LẤY DỮ LIỆU ---
  const loadCommunityDetails = useCallback(async () => {
      if (!id) return;

      setLoading(true);
      try {
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

  // --- FR-12.1.3: LOGIC XUẤT BÁO CÁO PDF ---
  const handleExportReport = async () => {
    if (!community || exportLoading) return;
      
      setExportLoading(true);

      try {
          // 1. Lấy TẤT CẢ dữ liệu Reports của người dùng
          const allUserReports = await getMyReports();
          
          const communityReports = allUserReports;

          // 2. Gom dữ liệu cần xuất
          const exportData = {
              communityName: community.name,
              groupId: community.id,
              stats: {
                  memberCount: community.memberCount,
                  totalReports: communityReports.length, 
                  recycledWasteKg: community.recycledWasteKg,
                  mockCampaigns: 12, 
              },
              reportsDetail: communityReports.map(r => ({
                  id: r.id,
                  description: r.description,
                  status: r.status,
                  date: r.createdAt,
              })),
              // CẬP NHẬT: Gửi chuỗi mô tả. Backend sẽ lấy tên đầy đủ từ token.
              exportedBy: 'Current User (System Override)', 
              exportedDate: new Date().toISOString(),
          };

          // 3. CẬP NHẬT: Gọi service API thực tế
          const response = await exportCommunityReport(exportData);
          
          if (response.success) {
              Alert.alert(
                  "Xuất báo cáo thành công", 
                  // CẬP NHẬT: Sử dụng email trả về từ Backend
                  `Báo cáo cho nhóm "${community.name}" (${communityReports.length} reports) đã được tạo và được gửi qua email đến: ${response.email}.`
              );
          } else {
              // CẬP NHẬT: Sử dụng thông báo lỗi cụ thể hơn từ response nếu có
              throw new Error(response.message || "API xuất báo cáo thất bại: Phản hồi không thành công.");
          }

      } catch (e) {
          console.error("Lỗi xuất báo cáo:", e.message);
          // Cập nhật Alert để hiển thị thông báo lỗi chi tiết hơn
          Alert.alert("Lỗi", e.message || "Không thể xuất báo cáo. Vui lòng thử lại sau.");
      } finally {
          setExportLoading(false);
      }
    };


  // --- LOGIC THAM GIA/RỜI NHÓM (giữ nguyên) ---
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
                style={styles.communityAvatar}
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

          <View style={styles.communityTextInfo}>
            <Text style={styles.communityName}>{community.name}</Text>
            
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
            onPress={() => { Alert.alert("Tính năng chưa có", "Tính năng theo dõi sẽ sớm được cập nhật."); }} 
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
        
        {/* ... (Các phần khác: secondRowButtons, statsSection, badgeSection giữ nguyên) ... */}

        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Thống kê cộng đồng</Text>
          <View style={styles.mainStatsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{community.memberCount}</Text>
                <Text style={styles.statLabel}>Thành viên</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Chiến dịch</Text>
              </View>
              <View style={styles.statItem}>
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
              <Text style={styles.smallCardValue}>
                2345 người{"\n"}tham gia
              </Text>
            </View>
          </View>
          {/* Chart Section - Mock UI */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Hoạt động cộng đồng</Text>
            </View>
            <View style={styles.chartContainer}>
                            <Text style={styles.chartLegendText}>Lượng rác tái chế (Tháng 9, 2025)</Text>
            </View>
          </View>
        </View>

        <View style={styles.badgeSection}>
          <Text style={styles.badgeSectionTitle}>Huy hiệu cộng đồng</Text>
          <View style={styles.badgeCardsRow}>
            <View style={styles.badgeCard}>
              <MaterialCommunityIcons name="shield-star" size={48} color="#FFFFFF" />
              <Text style={styles.badgeCardTitle}>Cộng đồng bảo vệ môi trường Cấp 2</Text>
              <Text style={styles.badgeCardSubtitle}>x4000kg rác tái chế</Text>
            </View>
            <View style={styles.badgeCard}>
              <MaterialCommunityIcons name="shield-star" size={48} color="#FFFFFF" />
              <Text style={styles.badgeCardTitle}>Cộng đồng năng động</Text>
              <Text style={styles.badgeCardSubtitle}>x10 chiến dịch</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* FR-12.1.3: FLOATING ACTION BUTTON (FAB) XUẤT BÁO CÁO */}
      <TouchableOpacity
        style={[styles.exportFAB, exportLoading && styles.exportFABDisabled]}
        onPress={handleExportReport}
        disabled={exportLoading}
        activeOpacity={0.8}
      >
        {exportLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <MaterialCommunityIcons name="file-export" size={28} color="#FFFFFF" />
        )}
      </TouchableOpacity>
      {/* KẾT THÚC FAB */}
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
    marginTop: 15,
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
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  chartLegendText: {
    ...typography.small,
    fontSize: 13,
    color: '#999',
    marginTop: 10,
  },

  badgeSection: {
    paddingHorizontal: 24,
    marginTop: 24,
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
  
  // --- FAB STYLES ---
  exportFAB: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: '#77d370ff', 
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  exportFABDisabled: {
    backgroundColor: '#bbeab8ff', 
    opacity: 0.7,
  }
});

export default CommunityDetailScreen;