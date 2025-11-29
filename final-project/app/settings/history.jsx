import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

const HistoryScreen = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filterOptions = [
    { id: "all", label: "Tất cả", icon: "format-list-bulleted" },
    { id: "aqi", label: "Báo cáo vi phạm", icon: "air-filter" },
    { id: "recycle", label: "Tái chế", icon: "recycle" },
    { id: "chatbot", label: "Chatbot", icon: "robot" },
  ];

  const allHistoryItems = [
    {
      id: 1,
      title: "Báo cáo vi phạm môi trường",
      location: "Quận 1, TP.HCM",
      date: "28/11/2025",
      time: "14:30",
      icon: "alert-circle",
      iconColor: "#FF3B30",
      type: "aqi",
    },
    {
      id: 2,
      title: "Quét mã QR tái chế",
      location: "Chai nhựa PET",
      date: "27/11/2025",
      time: "10:15",
      icon: "recycle",
      iconColor: "#007AFF",
      type: "recycle",
    },
    {
      id: 3,
      title: "Chat với AI về môi trường",
      location: "Tư vấn về phân loại rác",
      date: "26/11/2025",
      time: "16:45",
      icon: "robot",
      iconColor: "#FF9500",
      type: "chatbot",
    },
    {
      id: 4,
      title: "Báo cáo xả rác bừa bãi",
      location: "Quận 7, TP.HCM",
      date: "25/11/2025",
      time: "09:20",
      icon: "alert-circle",
      iconColor: "#FF3B30",
      type: "aqi",
    },
  ];

  const historyItems =
    selectedFilter === "all"
      ? allHistoryItems
      : allHistoryItems.filter((item) => item.type === selectedFilter);

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
        <Text style={styles.headerTitle}>Lịch sử hoạt động</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterScrollContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterChip,
              selectedFilter === option.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(option.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={18}
              color={selectedFilter === option.id ? "#FFFFFF" : "#666"}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === option.id && styles.filterChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.scrollContent}>
          <View style={styles.historySection}>
            {historyItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.historyItem,
                  index === historyItems.length - 1 && styles.historyItemLast,
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${item.iconColor}15` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={26}
                    color={item.iconColor}
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyLocation}>{item.location}</Text>
                  <Text style={styles.historyDateTime}>
                    {item.date} • {item.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.clearButton} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={22}
              color="#FF3B30"
            />
            <Text style={styles.clearButtonText}>Xóa lịch sử</Text>
          </TouchableOpacity>
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
    paddingVertical: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0EFED",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.4,
  },
  placeholder: {
    width: 48,
  },

  filterScrollView: {
    marginVertical: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  filterChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    elevation: 5,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    transform: [{ scale: 1.02 }],
  },
  filterChipText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },

  historySection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFED",
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
    justifyContent: "center",
  },
  historyTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 4,
  },
  historyLocation: {
    ...typography.small,
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  historyDateTime: {
    ...typography.small,
    fontSize: 12,
    color: "#999",
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FF3B30",
    elevation: 3,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  clearButtonText: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: "700",
    color: "#FF3B30",
    marginLeft: 10,
    letterSpacing: -0.3,
  },
});

export default HistoryScreen;
