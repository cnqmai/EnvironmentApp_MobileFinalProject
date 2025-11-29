import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

const ProfileScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.logout === "true") {
      setIsLoggedIn(false);
    }
  }, [params.logout]);

  const MenuItem = ({ icon, title, onPress }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        console.log(`MenuItem clicked: ${title}`);
        onPress?.();
      }}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={icon} size={20} color="#0A0A0A" />
      <Text style={styles.menuItemText}>{title}</Text>
    </TouchableOpacity>
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.guestHeader}>
            <View style={styles.guestAvatarContainer}>
              <MaterialCommunityIcons
                name="emoticon-happy-outline"
                size={56}
                color="#666"
              />
            </View>
            <Text style={styles.guestTitle}>Chưa đăng nhập</Text>
          </View>

          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={20}
                color="#666"
              />
              <Text style={styles.locationText}>Thành phố Hồ Chí Minh</Text>
            </View>
          </View>

          <View style={styles.loginPromptCard}>
            <Text style={styles.loginPromptTitle}>Đăng nhập để ...</Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#4CAF50"
                />
                <Text style={styles.featureText}>Lưu vị trí yêu thích</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#4CAF50"
                />
                <Text style={styles.featureText}>Nhận cảnh báo AQI</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#4CAF50"
                />
                <Text style={styles.featureText}>Xem lịch sử báo cáo</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#4CAF50"
                />
                <Text style={styles.featureText}>Tích lũy điểm thành tích</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => setIsLoggedIn(true)}
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
              <MaterialCommunityIcons
                name="emoticon-happy-outline"
                size={56}
                color="#0a0a0aff"
              />
            </View>
            <Text style={styles.userName}>Lưu Thuý Anh</Text>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="email-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.infoText}>anh123@gmail.com</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.infoText}>0123456789</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.infoText}>Thành phố Hồ Chí Minh</Text>
            </View>
          </View>

          <View style={styles.greenWarriorCard}>
            <View style={styles.greenWarriorHeader}>
              <MaterialCommunityIcons name="leaf" size={24} color="#4CAF50" />
              <Text style={styles.greenWarriorTitle}>CHIẾN BINH XANH</Text>
            </View>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Điểm xanh</Text>
              <Text style={styles.pointsValue}>200/300xp</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: "66.67%" }]} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.learnMoreButton}
              activeOpacity={0.7}
            >
              <Text style={styles.learnMoreText}>Tìm hiểu thêm về </Text>
              <Text style={styles.learnMoreBold}>Huy hiệu xanh</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color="#4CAF50"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={32}
                color="#0A0A0A"
              />
              <Text style={styles.statText}>12 báo cáo đã gửi</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={32}
                color="#0A0A0A"
              />
              <Text style={styles.statText}>8 câu hỏi chatbot</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Phân loại rác</Text>
            <Text style={styles.sectionSubtitle}>Tháng 11, 2025</Text>

            <View style={styles.chartContainer}>
              <View style={styles.chartLegend}>
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
                  <Text style={styles.legendText}>Hôm nay (30)</Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chartScrollView}
                contentContainerStyle={styles.chartBars}
              >
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const isToday = day === 30;
                  const height = isToday
                    ? "90%"
                    : `${Math.floor(Math.random() * 40 + 40)}%`;

                  return (
                    <View key={day} style={styles.barGroup}>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            isToday ? styles.barDark : styles.barLight,
                            { height },
                          ]}
                        />
                        {isToday && <View style={styles.chartDot} />}
                      </View>
                      <Text
                        style={[
                          styles.barLabel,
                          isToday && styles.barLabelActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          <View style={styles.badgeSection}>
            <Text style={styles.sectionTitle}>Huy hiệu của bạn</Text>

            <View style={styles.badgeCard}>
              <View style={styles.badgeIconContainer}>
                <MaterialCommunityIcons
                  name="shield-star"
                  size={48}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.badgeContent}>
                <Text style={styles.badgeTitle}>Cảnh sát môi trường</Text>
                <Text style={styles.badgeDescription}>10 báo cáo</Text>
              </View>
              <MaterialCommunityIcons name="medal" size={32} color="#F0EFED" />
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
              icon="cog-outline"
              title="Cài đặt"
              onPress={() => {
                console.log("Opening settings...");
                router.push("/settings");
              }}
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

  sectionCard: {
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
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 20,
  },

  chartContainer: {
    marginTop: 10,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.small,
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  chartScrollView: {
    flexGrow: 0,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 4,
    paddingBottom: 8,
    paddingTop: 16,
    gap: 4,
  },
  barGroup: {
    alignItems: "center",
  },
  barContainer: {
    width: 32,
    height: 150,
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  bar: {
    width: "100%",
    borderRadius: 8,
  },
  barLight: {
    backgroundColor: "#E3F2FD",
  },
  barDark: {
    backgroundColor: "#007AFF",
  },
  chartDot: {
    position: "absolute",
    top: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  barLabel: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "500",
    color: "#999",
    marginTop: 8,
  },
  barLabelActive: {
    fontWeight: "700",
    color: "#0A0A0A",
  },

  badgeSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  badgeCard: {
    flexDirection: "row",
    backgroundColor: "#34C759",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  badgeDescription: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
    opacity: 0.9,
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
