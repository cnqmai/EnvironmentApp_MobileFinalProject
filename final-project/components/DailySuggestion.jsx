import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import typography from "../styles/typography";

const suggestions = [
  {
    icon: "recycle",
    title: "Phân loại rác tái chế",
    description: "Hãy phân loại rác thải tại nhà để bảo vệ môi trường.",
    color: "#34C759",
  },
  {
    icon: "water-outline",
    title: "Tiết kiệm nước",
    description: "Tắt vòi khi đánh răng, giảm thời gian tắm để tiết kiệm nước.",
    color: "#007AFF",
  },
  {
    icon: "lightbulb-outline",
    title: "Tiết kiệm điện năng",
    description: "Tắt đèn và thiết bị điện khi không sử dụng.",
    color: "#FF9500",
  },
  {
    icon: "leaf",
    title: "Trồng cây xanh",
    description: "Trồng thêm cây xanh quanh nhà để cải thiện không khí.",
    color: "#4CAF50",
  },
  {
    icon: "bag-personal-outline",
    title: "Sử dụng túi tái sử dụng",
    description: "Mang túi vải khi đi mua sắm thay vì túi nilon.",
    color: "#8B4513",
  },
  {
    icon: "bicycle",
    title: "Đi xe đạp hoặc đi bộ",
    description: "Hạn chế sử dụng xe máy cho quãng đường ngắn.",
    color: "#FF6B6B",
  },
  {
    icon: "food-apple-outline",
    title: "Giảm lãng phí thực phẩm",
    description: "Mua đủ ăn, bảo quản thực phẩm đúng cách.",
    color: "#FF5722",
  },
  {
    icon: "air-filter",
    title: "Cải thiện chất lượng không khí",
    description: "Sử dụng cây thanh lọc không khí trong nhà.",
    color: "#9C27B0",
  },
];

const DailySuggestion = () => {
  const getDailySuggestion = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );
    const index = dayOfYear % suggestions.length;
    return suggestions[index];
  };

  const dailySuggestion = getDailySuggestion();

  return (
    <View style={styles.actionCard}>
      <Text style={styles.actionTitle}>Gợi ý hành động hôm nay</Text>
      <View style={styles.suggestionItem}>
        <View
          style={[
            styles.suggestionIconContainer,
            { backgroundColor: `${dailySuggestion.color}15` },
          ]}
        >
          <MaterialCommunityIcons
            name={dailySuggestion.icon}
            size={24}
            color={dailySuggestion.color}
          />
        </View>
        <Text style={styles.suggestionText}>{dailySuggestion.title}</Text>
      </View>
      <Text style={styles.suggestionSubtext}>
        {dailySuggestion.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: "#FFFFFF",
    marginVertical: 12,
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  actionTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    color: "#0A0A0A",
    letterSpacing: -0.4,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  suggestionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  suggestionText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0A0A",
    flex: 1,
  },
  suggestionSubtext: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginLeft: 44,
    lineHeight: 20,
  },
});

export default DailySuggestion;
