import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ForumPostCard from "../../components/community/ForumPostCard";
import typography from "../../styles/typography";

const CommunityDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isFollowing, setIsFollowing] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [eventMenuVisible, setEventMenuVisible] = useState(false);
  const isAdmin = true; // Mock admin status
  const isJoined = true; // Mock joined status

  // Mock data
  const community = {
    id: id,
    name: "Cộng đồng bảo vệ môi trường",
    members: 325,
    campaigns: 12,
    recycledWeight: 5420,
    reports: 320,
    participants: 2345,
  };

  // Mock forum posts - filtered by community
  const forumPosts = [
    {
      id: 1,
      author: "Nguyễn Văn A",
      badge: "Cấp 2",
      date: "2 giờ trước",
      community: community.name,
      content:
        "Kết quả chiến dịch làm sạch bãi biển tuần qua: Chúng ta đã thu gom được 250kg rác thải, trong đó có 180kg nhựa có thể tái chế. Cảm ơn tất cả các thành viên đã tham gia nhiệt tình! 🌊♻️",
      image: true,
      likes: 45,
      comments: 12,
      shares: 5,
    },
    {
      id: 2,
      author: "Trần Thị B",
      badge: "Cấp 1",
      date: "5 giờ trước",
      community: community.name,
      content:
        "Tips giảm thiểu rác thải nhựa trong gia đình:\n1. Mang túi vải khi đi chợ\n2. Sử dụng bình nước cá nhân\n3. Chọn đồ dùng bằng tre, gỗ thay vì nhựa\n4. Mua thực phẩm tươi sống, hạn chế đóng gói\nCác bạn còn tips nào khác không? 🌱",
      image: false,
      likes: 78,
      comments: 23,
      shares: 15,
    },
    {
      id: 3,
      author: "Lê Văn C",
      date: "1 ngày trước",
      community: community.name,
      content:
        "Hỏi: Địa điểm thu gom rác tái chế ở Quận 1? Mình đang ở khu vực Quận 1, có ai biết địa điểm nào thu gom rác tái chế gần đây không ạ? Mình có khá nhiều chai nhựa và giấy carton cần xử lý. Cảm ơn nhiều! 🙏",
      image: false,
      likes: 12,
      comments: 8,
      shares: 2,
    },
  ];

  const handleFollowToggle = () => {
    if (isJoined) {
      setIsFollowing(!isFollowing);
    }
  };

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
  };

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
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.eventMenuButton}
              onPress={() => setEventMenuVisible(!eventMenuVisible)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="calendar-month"
                size={24}
                color="#007AFF"
              />
            </TouchableOpacity>
            {eventMenuVisible && (
              <View style={styles.eventDropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setEventMenuVisible(false);
                    router.push(`/community/${id}/events`);
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="calendar-star"
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.dropdownItemText}>Xem sự kiện</Text>
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setEventMenuVisible(false);
                    router.push("/community/create-event");
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="calendar-plus"
                    size={20}
                    color="#4CAF50"
                  />
                  <Text style={styles.dropdownItemText}>Tạo sự kiện</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.introCard}>
          <View style={styles.cardTopSection}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons
                name="shield-check"
                size={48}
                color="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.communityName}>{community.name}</Text>
            <View style={styles.memberBadge}>
              <MaterialCommunityIcons
                name="account-group"
                size={14}
                color="#666"
              />
              <Text style={styles.memberCount}>
                {community.members} thành viên
              </Text>
            </View>
            <Text style={styles.communityDescription}>
              Cộng đồng hoạt động vì môi trường xanh, sạch, bền vững
            </Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followButtonActive,
              ]}
              onPress={handleFollowToggle}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isFollowing ? "account-check" : "account-plus"}
                size={18}
                color={isFollowing ? "#FFFFFF" : "#333"}
              />
              <Text
                style={[
                  styles.followButtonText,
                  isFollowing && styles.followButtonTextActive,
                ]}
              >
                {isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.notificationButton,
                notificationEnabled && styles.notificationButtonActive,
              ]}
              onPress={handleNotificationToggle}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={notificationEnabled ? "bell" : "bell-outline"}
                size={18}
                color={notificationEnabled ? "#FFFFFF" : "#666"}
              />
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                style={styles.settingsButton}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="cog" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "info" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("info")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "info" && styles.tabButtonTextActive,
              ]}
            >
              Thông tin chung
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "forum" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("forum")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "forum" && styles.tabButtonTextActive,
              ]}
            >
              Diễn đàn
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "info" && (
          <>
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>Thống kê cộng đồng</Text>

              <View style={styles.mainStatsCard}>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{community.members}</Text>
                    <Text style={styles.statLabel}>Thành viên</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{community.campaigns}</Text>
                    <Text style={styles.statLabel}>Chiến dịch</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {community.recycledWeight}kg
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
                    {community.reports} báo cáo{"\n"}đã gửi
                  </Text>
                </View>

                <View style={styles.smallCard}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={28}
                    color="#0A0A0A"
                  />
                  <Text style={styles.smallCardValue}>
                    {community.participants} người{"\n"}tham gia
                  </Text>
                </View>
              </View>

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
                      const heights = [
                        45, 38, 52, 48, 55, 50, 43, 58, 62, 70, 85,
                      ];
                      const height = heights[i];

                      return (
                        <View key={month} style={styles.barGroup}>
                          <View style={styles.barContainer}>
                            <View
                              style={[
                                styles.bar,
                                isCurrentMonth
                                  ? styles.barDark
                                  : styles.barLight,
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
                  <Text style={styles.badgeCardSubtitle}>
                    4000kg rác tái chế
                  </Text>
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
          </>
        )}

        {activeTab === "forum" && (
          <View style={styles.forumContent}>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => router.push("/community/create-post")}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="pencil-plus"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.createPostButtonText}>Tạo bài viết mới</Text>
            </TouchableOpacity>

            {forumPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                onPress={() => router.push(`/community/post/${post.id}`)}
              />
            ))}
          </View>
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
  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.4,
  },
  headerRight: {
    position: "relative",
    width: 44,
  },
  eventMenuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  eventDropdown: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    minWidth: 160,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 4,
  },

  introCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTopSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  infoSection: {
    marginBottom: 16,
  },
  communityName: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "800",
    color: "#0A0A0A",
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  communityDescription: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: "#666",
    fontWeight: "500",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  followButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F0F0F0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 0,
  },
  followButtonActive: {
    backgroundColor: "#007AFF",
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  followButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  followButtonTextActive: {
    color: "#FFFFFF",
  },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    borderWidth: 0,
  },
  notificationButtonActive: {
    backgroundColor: "#4CAF50",
    elevation: 2,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    borderWidth: 0,
  },

  tabNavigation: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabButtonActive: {
    backgroundColor: "#007AFF",
    elevation: 3,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },

  statsSection: {
    paddingHorizontal: 16,
    marginTop: 0,
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
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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

  forumContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  createPostButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default CommunityDetailScreen;
