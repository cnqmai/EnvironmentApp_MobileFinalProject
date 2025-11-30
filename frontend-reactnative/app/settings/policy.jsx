
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

const PolicyScreen = () => {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState(null);

  const policyItems = [
    {
      id: "privacy",
      title: "Chính sách bảo mật",
      icon: "shield-check-outline",
      content:
        "Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Mọi dữ liệu được mã hóa và không chia sẻ với bên thứ ba mà không có sự đồng ý của bạn.",
    },
    {
      id: "terms",
      title: "Điều khoản sử dụng",
      icon: "file-document-outline",
      content:
        "Bằng cách sử dụng ứng dụng, bạn đồng ý với các điều khoản và điều kiện của chúng tôi. Vui lòng sử dụng ứng dụng một cách có trách nhiệm.",
    },
    {
      id: "data",
      title: "Thu thập dữ liệu",
      icon: "database-outline",
      content:
        "Chúng tôi thu thập dữ liệu vị trí, thông tin sử dụng và dữ liệu môi trường để cung cấp dịch vụ tốt nhất cho bạn. Bạn có thể tắt thu thập dữ liệu bất kỳ lúc nào.",
    },
    {
      id: "cookies",
      title: "Chính sách Cookie",
      icon: "cookie-outline",
      content:
        "Ứng dụng sử dụng cookies để cải thiện trải nghiệm người dùng và ghi nhớ tùy chọn của bạn.",
    },
  ];

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
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
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#0A0A0A"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chính sách & Điều khoản</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.policySection}>
          {policyItems.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                style={[
                  styles.policyItem,
                  index === policyItems.length - 1 &&
                    expandedSection !== item.id &&
                    styles.policyItemLast,
                ]}
                onPress={() => toggleSection(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.policyLeft}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color="#007AFF"
                  />
                  <Text style={styles.policyTitle}>{item.title}</Text>
                </View>
                <MaterialCommunityIcons
                  name={
                    expandedSection === item.id ? "chevron-up" : "chevron-down"
                  }
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
              {expandedSection === item.id && (
                <View
                  style={[
                    styles.policyContent,
                    index === policyItems.length - 1 &&
                      styles.policyContentLast,
                  ]}
                >
                  <Text style={styles.policyText}>{item.content}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color="#007AFF"
          />
          <Text style={styles.infoText}>
            Cập nhật lần cuối: 29/11/2025{"\n"}
            Phiên bản: 1.0.0
          </Text>
        </View>

        <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="#007AFF"
          />
          <Text style={styles.contactButtonText}>Liên hệ với chúng tôi</Text>
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

  policySection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  policyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFED",
  },
  policyItemLast: {
    borderBottomWidth: 0,
  },
  policyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  policyTitle: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
    marginLeft: 12,
  },
  policyContent: {
    paddingTop: 4,
    paddingBottom: 16,
    paddingHorizontal: 36,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFED",
  },
  policyContentLast: {
    borderBottomWidth: 0,
  },
  policyText: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  infoText: {
    ...typography.small,
    fontSize: 13,
    color: "#007AFF",
    marginLeft: 10,
    lineHeight: 18,
  },

  contactButton: {
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
  contactButtonText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
});

export default PolicyScreen;
