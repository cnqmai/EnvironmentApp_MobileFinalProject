import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

const UserGuideScreen = () => {
  const router = useRouter();

  const guideSteps = [
    {
      id: 1,
      title: "Kiểm tra chất lượng không khí",
      icon: "air-filter",
      iconColor: "#34C759",
      steps: [
        "Mở ứng dụng và vào tab Trang chủ",
        "Xem chỉ số AQI hiện tại của khu vực bạn",
        "Đọc các khuyến nghị về sức khỏe",
        "Kiểm tra dự báo chất lượng không khí",
      ],
    },
    {
      id: 2,
      title: "Sử dụng tính năng tái chế",
      icon: "recycle",
      iconColor: "#007AFF",
      steps: [
        "Vào tab Tái chế",
        "Chọn 'Quét mã QR' để quét sản phẩm",
        "Hoặc chọn 'Tìm kiếm' để tra cứu hướng dẫn",
        "Xem hướng dẫn chi tiết cách tái chế",
        "Tích điểm khi hoàn thành hoạt động",
      ],
    },
    {
      id: 3,
      title: "Chat với AI về môi trường",
      icon: "robot",
      iconColor: "#FF9500",
      steps: [
        "Nhấn vào biểu tượng chat ở góc phải màn hình",
        "Nhập câu hỏi về môi trường, tái chế",
        "AI sẽ trả lời và tư vấn chi tiết",
        "Có thể chat bằng giọng nói",
      ],
    },
    {
      id: 4,
      title: "Quản lý thông báo",
      icon: "bell-outline",
      iconColor: "#FF3B30",
      steps: [
        "Vào Cài đặt > Thông báo",
        "Bật/tắt các loại thông báo",
        "Cài đặt cảnh báo AQI",
        "Nhận nhắc nhở về tái chế",
      ],
    },
    {
      id: 5,
      title: "Xem lịch sử hoạt động",
      icon: "history",
      iconColor: "#5856D6",
      steps: [
        "Vào Cài đặt > Lịch sử hoạt động",
        "Xem các hoạt động đã thực hiện",
        "Kiểm tra điểm tích lũy",
        "Có thể xóa lịch sử nếu cần",
      ],
    },
  ];

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
          <Text style={styles.headerTitle}>Hướng dẫn sử dụng</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.introSection}>
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={48}
            color="#007AFF"
          />
          <Text style={styles.introTitle}>
            Chào mừng đến với Environment App!
          </Text>
          <Text style={styles.introText}>
            Ứng dụng giúp bạn theo dõi chất lượng không khí, học cách tái chế và
            bảo vệ môi trường.
          </Text>
        </View>

        {guideSteps.map((guide, index) => (
          <View key={guide.id} style={styles.guideSection}>
            <View style={styles.guideHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${guide.iconColor}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name={guide.icon}
                  size={28}
                  color={guide.iconColor}
                />
              </View>
              <View style={styles.guideHeaderText}>
                <Text style={styles.guideNumber}>Bước {guide.id}</Text>
                <Text style={styles.guideTitle}>{guide.title}</Text>
              </View>
            </View>
            <View style={styles.stepsContainer}>
              {guide.steps.map((step, stepIndex) => (
                <View key={stepIndex} style={styles.stepItem}>
                  <View style={styles.stepBullet}>
                    <Text style={styles.stepBulletText}>{stepIndex + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.tipSection}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={24}
              color="#FF9500"
            />
            <Text style={styles.tipTitle}>Mẹo sử dụng</Text>
          </View>
          <Text style={styles.tipText}>
            • Bật thông báo để nhận cảnh báo về chất lượng không khí{"\n"}• Tích
            điểm khi thực hiện các hoạt động tái chế{"\n"}• Sử dụng AI để tìm
            hiểu thêm về môi trường{"\n"}• Chia sẻ ứng dụng với bạn bè để cùng
            bảo vệ môi trường
          </Text>
        </View>

        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => router.push("/settings/help")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={20}
            color="#007AFF"
          />
          <Text style={styles.supportButtonText}>Cần hỗ trợ thêm?</Text>
        </TouchableOpacity>
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

  introSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  introTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  introText: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
  },

  guideSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  guideHeaderText: {
    flex: 1,
  },
  guideNumber: {
    ...typography.small,
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 4,
  },
  guideTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
  },

  stepsContainer: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stepBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepBulletText: {
    ...typography.small,
    fontSize: 12,
    fontWeight: "700",
    color: "#007AFF",
  },
  stepText: {
    ...typography.body,
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    flex: 1,
  },

  tipSection: {
    backgroundColor: "#FFF9E6",
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
    marginLeft: 8,
  },
  tipText: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    lineHeight: 24,
  },

  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#007AFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  supportButtonText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
});

export default UserGuideScreen;