import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

export default function MoreScreen() {
  const router = useRouter();

  const menuItems = [
    {
      id: "community",
      label: "Cộng đồng",
      icon: "account-group",
      description: "Tham gia cộng đồng, chia sẻ mẹo sống xanh",
      route: "/community",
      color: "#007AFF",
    },
    {
      id: "chat",
      label: "Chat",
      icon: "chat",
      description: "Trò chuyện với chatbot về môi trường",
      route: "/chat/chatbot",
      color: "#34C759",
    },
    {
      id: "report",
      label: "Báo cáo",
      icon: "file-document-outline",
      description: "Gửi báo cáo vi phạm môi trường",
      route: "/report",
      color: "#FF9500",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thêm</Text>
          <Text style={styles.headerSubtitle}>Các tính năng khác</Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={28}
                  color={item.color}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 32,
    fontWeight: "800",
    color: "#0A0A0A",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
  },

  menuSection: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  menuDescription: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    lineHeight: 18,
  },
});
