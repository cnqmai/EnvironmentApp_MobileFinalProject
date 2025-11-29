import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

const HelpScreen = () => {
  const router = useRouter();

  const faqItems = [
    {
      id: 1,
      question: "Làm thế nào để kiểm tra chất lượng không khí?",
      answer:
        "Vào tab Trang chủ và xem thông tin AQI hiện tại của khu vực bạn.",
    },
    {
      id: 2,
      question: "Cách sử dụng tính năng tái chế?",
      answer:
        "Vào tab Tái chế, quét mã QR trên sản phẩm hoặc tìm kiếm hướng dẫn tái chế.",
    },
    {
      id: 3,
      question: "Làm sao để chat với AI?",
      answer:
        "Nhấn vào biểu tượng chat ở góc phải màn hình để bắt đầu trò chuyện với AI.",
    },
    {
      id: 4,
      question: "Tôi có thể xem lịch sử hoạt động ở đâu?",
      answer:
        "Vào Cài đặt > Lịch sử hoạt động để xem tất cả các hoạt động của bạn.",
    },
  ];

  const contactItems = [
    {
      id: "email",
      label: "Email hỗ trợ",
      value: "support@environmentapp.com",
      icon: "email-outline",
      action: () => Linking.openURL("mailto:support@environmentapp.com"),
    },
    {
      id: "phone",
      label: "Hotline",
      value: "1900-xxxx",
      icon: "phone-outline",
      action: () => Linking.openURL("tel:1900xxxx"),
    },
    {
      id: "website",
      label: "Website",
      value: "www.environmentapp.com",
      icon: "web",
      action: () => Linking.openURL("https://www.environmentapp.com"),
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
          <Text style={styles.headerTitle}>Trợ giúp</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
          <View style={styles.faqSection}>
            {faqItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.faqItem,
                  index === faqItems.length - 1 && styles.faqItemLast,
                ]}
              >
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ hỗ trợ</Text>
          <View style={styles.contactSection}>
            {contactItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.contactItem,
                  index === contactItems.length - 1 && styles.contactItemLast,
                ]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.contactLeft}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color="#007AFF"
                  />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>{item.label}</Text>
                    <Text style={styles.contactValue}>{item.value}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.guideButton}
          onPress={() => router.push("/settings/user-guide")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="book-open-outline"
            size={20}
            color="#007AFF"
          />
          <Text style={styles.guideButtonText}>Hướng dẫn sử dụng chi tiết</Text>
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

  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 12,
    paddingHorizontal: 24,
  },

  faqSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  faqItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFED",
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  faqAnswer: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  contactSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFED",
  },
  contactItemLast: {
    borderBottomWidth: 0,
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 4,
  },
  contactValue: {
    ...typography.small,
    fontSize: 13,
    color: "#007AFF",
  },

  guideButton: {
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
  guideButtonText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
});

export default HelpScreen;