import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react"; 
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator, 
  RefreshControl, 
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "../../../components/community/EventCard";
import typography from "../../../styles/typography";
// CẬP NHẬT IMPORT: Sử dụng fetchAllEvents (đã được sửa trong file service trước)
import { fetchAllEvents } from "../../../src/services/campaignService"; 

// Helper function để format ngày giờ từ OffsetDateTime (giả định)
const formatDateTime = (offsetDateTime) => {
    if (!offsetDateTime) return { date: 'N/A', time: 'N/A' };
    try {
        const dateObj = new Date(offsetDateTime);
        const date = dateObj.toLocaleDateString('vi-VN');
        const time = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return { date, time };
    } catch (e) {
        return { date: 'N/A', time: 'N/A' };
    }
};

const CommunityEventsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [events, setEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- LOGIC FETCH DỮ LIỆU TỪ DB (SỬ DỤNG DTO) ---
  const fetchEvents = useCallback(async () => {
    try {
      // Gọi API lấy TẤT CẢ sự kiện
      const data = await fetchAllEvents(); 
      
      // Ánh xạ dữ liệu từ CampaignResponse DTO sang cấu trúc Frontend Event
      const mappedEvents = data.map(campaign => {
          const { date, time } = formatDateTime(campaign.eventDate);
          
          let participants = 0;
          let maxParticipants = 0;
          const participantParts = campaign.participantInfo.split('/');
          if (participantParts.length === 2) {
              participants = parseInt(participantParts[0]);
              maxParticipants = parseInt(participantParts[1]);
          }

          return {
              id: campaign.id,
              title: campaign.title,
              description: campaign.description || '',
              date: date,
              time: time,
              location: campaign.location || 'Chưa xác định',
              participants: participants,
              maxParticipants: maxParticipants,
              status: campaign.status,
              image: campaign.iconCode, // Dùng iconCode làm image
              communityId: campaign.communityId, // Dùng cho router
          };
      });

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Lỗi lấy sự kiện cộng đồng:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };
  // --- KẾT THÚC LOGIC FETCH ---

  const filterOptions = [
    { value: "all", label: "Tất cả", icon: "calendar" },
    { value: "upcoming", label: "Sắp diễn ra", icon: "calendar-clock" },
    { value: "completed", label: "Đã hoàn thành", icon: "calendar-check" },
  ];

  const filteredEvents =
    selectedFilter === "all"
      ? events
      : events.filter((event) => event.status === selectedFilter);
      
  const handleCreateEvent = () => {
    router.push(`/community/create-event`); 
  };

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
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
            </View>
        ) : filteredEvents.length === 0 ? (
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
      
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleCreateEvent}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      
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
    backgroundColor: "#4CAF50", // Đổi màu xanh dương sang Xanh lá
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
  
  centerContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    ...typography.body,
    fontSize: 15,
    color: "#666",
    marginTop: 10,
  },
  fab: { 
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: '#4CAF50', 
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10, 
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