import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../../../styles/typography";

const EventDetailScreen = () => {
  const router = useRouter();
  const { id, eventId } = useLocalSearchParams();
  const [isRegistered, setIsRegistered] = useState(false);

  // Mock data
  const event = {
    id: eventId,
    title: "Chiến dịch làm sạch bãi biển Nha Trang",
    description:
      "Chúng tôi tổ chức chiến dịch làm sạch bãi biển nhằm nâng cao ý thức bảo vệ môi trường biển và giảm thiểu rác thải nhựa. Mọi người sẽ được hướng dẫn cách thu gom rác đúng cách, phân loại rác tại nguồn và tìm hiểu về tác hại của rác thải nhựa đến hệ sinh thái biển.",
    date: "15/12/2025",
    time: "07:00 - 10:00",
    location: "Bãi biển Trần Phú, Nha Trang",
    participants: 156,
    maxParticipants: 200,
    status: "upcoming",
    organizer: "Cộng đồng bảo vệ môi trường Cấp 2",
    coordinator: {
      name: "Nguyễn Văn An",
      phone: "0912 345 678",
      email: "nguyenvanan@email.com",
    },
    requirements: [
      "Mang theo găng tay và khẩu trang",
      "Mặc trang phục thoải mái, phù hợp với hoạt động ngoài trời",
      "Mang theo nước uống cá nhân",
      "Đến đúng giờ để nhận hướng dẫn",
    ],
    benefits: [
      "Nhận chứng nhận tham gia hoạt động tình nguyện",
      "Được cung cấp dụng cụ và hướng dẫn an toàn",
      "Bữa sáng nhẹ và nước uống",
      "Cơ hội kết nối với những người có cùng chí hướng",
    ],
  };

  const handleRegister = () => {
    setIsRegistered(!isRegistered);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${event.title}\n\n${event.description}\n\nNgày: ${event.date} | Giờ: ${event.time}\nĐịa điểm: ${event.location}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        <Text style={styles.headerTitle}>Chi tiết sự kiện</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="share-variant"
            size={24}
            color="#0A0A0A"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBadgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: "#007AFF" }]}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.statusBadgeText}>Sắp diễn ra</Text>
          </View>
        </View>

        <Text style={styles.eventTitle}>{event.title}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color="#007AFF"
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Ngày</Text>
              <Text style={styles.infoValue}>{event.date}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#007AFF"
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Thời gian</Text>
              <Text style={styles.infoValue}>{event.time}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#007AFF"
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Địa điểm</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color="#007AFF"
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Người tham gia</Text>
              <Text style={styles.infoValue}>
                {event.participants}/{event.maxParticipants} người
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Về sự kiện này</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yêu cầu tham gia</Text>
          {event.requirements.map((req, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>{req}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quyền lợi khi tham gia</Text>
          {event.benefits.map((benefit, index) => (
            <View key={index} style={styles.listItem}>
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color="#34C759"
              />
              <Text style={styles.listText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="account" size={18} color="#666" />
              <Text style={styles.contactText}>
                Điều phối viên: {event.coordinator.name}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="phone" size={18} color="#666" />
              <Text style={styles.contactText}>{event.coordinator.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="email" size={18} color="#666" />
              <Text style={styles.contactText}>{event.coordinator.email}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.participantsInfo}>
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color="#007AFF"
          />
          <Text style={styles.participantsText}>
            {event.maxParticipants - event.participants} chỗ còn lại
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.registerButton,
            isRegistered && styles.registerButtonActive,
          ]}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isRegistered ? "check-circle" : "calendar-plus"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.registerButtonText}>
            {isRegistered ? "Đã đăng ký" : "Đăng ký tham gia"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#F0EFED",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    elevation: 1,
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
  shareButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },

  statusBadgeContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusBadgeText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  eventTitle: {
    ...typography.h1,
    fontSize: 26,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 20,
    lineHeight: 34,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "500",
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 12,
  },
  descriptionText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 24,
    color: "#666",
  },

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
    marginTop: 8,
  },
  listText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    flex: 1,
  },

  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contactText: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 30,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  participantsText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonActive: {
    backgroundColor: "#34C759",
  },
  registerButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default EventDetailScreen;