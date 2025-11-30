import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "../../../components/community/EventCard";
import typography from "../../../styles/typography";

const CommunityEventsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data - trong thực tế sẽ fetch từ API
  const events = [
    {
      id: 1,
      title: "Chiến dịch làm sạch bãi biển Nha Trang",
      description:
        "Tham gia cùng chúng tôi dọn sạch bãi biển, bảo vệ môi trường biển",
      date: "15/12/2025",
      time: "07:00 - 10:00",
      location: "Bãi biển Trần Phú, Nha Trang",
      participants: 156,
      maxParticipants: 200,
      status: "upcoming",
      image: null,
      organizer: "Cộng đồng bảo vệ môi trường Cấp 2",
    },
    {
      id: 2,
      title: "Hội thảo: Giảm thiểu rác thải nhựa",
      description:
        "Chia sẻ kinh nghiệm và giải pháp giảm thiểu rác thải nhựa trong đời sống",
      date: "20/12/2025",
      time: "14:00 - 17:00",
      location: "Trung tâm Văn hóa Quận 1, TP.HCM",
      participants: 89,
      maxParticipants: 150,
      status: "upcoming",
      image: null,
      organizer: "Cộng đồng bảo vệ môi trường Cấp 2",
    },
    {
      id: 3,
      title: "Trồng cây xanh tại công viên Tao Đàn",
      description: "Cùng nhau trồng 500 cây xanh, tạo không gian sống xanh",
      date: "10/12/2025",
      time: "06:00 - 09:00",
      location: "Công viên Tao Đàn, TP.HCM",
      participants: 200,
      maxParticipants: 200,
      status: "completed",
      image: null,
      organizer: "Cộng đồng bảo vệ môi trường Cấp 2",
    },
    {
      id: 4,
      title: "Phân loại rác tại nguồn - Workshop",
      description: "Hướng dẫn chi tiết cách phân loại rác tại nguồn hiệu quả",
      date: "05/12/2025",
      time: "09:00 - 11:00",
      location: "Online - Zoom Meeting",
      participants: 234,
      maxParticipants: 300,
      status: "completed",
      image: null,
      organizer: "Cộng đồng bảo vệ môi trường Cấp 2",
    },
  ];

  const filterOptions = [
    { value: "all", label: "Tất cả", icon: "calendar" },
    { value: "upcoming", label: "Sắp diễn ra", icon: "calendar-clock" },
    { value: "completed", label: "Đã hoàn thành", icon: "calendar-check" },
  ];

  const filteredEvents =
    selectedFilter === "all"
      ? events
      : events.filter((event) => event.status === selectedFilter);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push(`/community/${id}`)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color="#0A0A0A"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sự kiện cộng đồng</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                selectedFilter === option.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(option.value)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={option.icon}
                size={16}
                color={selectedFilter === option.value ? "#FFFFFF" : "#666"}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === option.value &&
                    styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={64}
              color="#CCC"
            />
            <Text style={styles.emptyStateText}>
              Chưa có sự kiện nào trong mục này
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              showStatus={true}
              onPress={() => router.push(`/community/${id}/events/${event.id}`)}
            />
          ))
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
    fontSize: 22,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 44,
  },

  filterContainer: {
    paddingVertical: 12,
    backgroundColor: "#F0EFED",
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    gap: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterChipActive: {
    backgroundColor: "#007AFF",
    elevation: 2,
  },
  filterChipText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateText: {
    ...typography.body,
    fontSize: 15,
    color: "#999",
    marginTop: 16,
  },
});

export default CommunityEventsScreen;
