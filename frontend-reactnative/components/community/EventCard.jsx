import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import typography from "../../styles/typography";

const EventCard = ({ event, onPress, showStatus = false, onRegister }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "#007AFF";
      case "completed":
        return "#34C759";
      case "ongoing":
        return "#FF9500";
      default:
        return "#999";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "Sắp diễn ra";
      case "completed":
        return "Đã hoàn thành";
      case "ongoing":
        return "Đang diễn ra";
      default:
        return "";
    }
  };

  // Format ngày tháng từ eventDate (OffsetDateTime)
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có ngày";
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return "Chưa có ngày";
    }
  };

  // Format giờ từ eventDate
  const formatTime = (dateString) => {
    if (!dateString) return "Chưa có giờ";
    try {
      const date = new Date(dateString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      return "Chưa có giờ";
    }
  };

  // Parse participant info (có thể là "5/20" hoặc "5 người")
  const parseParticipants = (participantInfo) => {
    if (!participantInfo) return { current: 0, max: null };
    
    // Nếu có dạng "5/20"
    const match = participantInfo.match(/(\d+)\/(\d+)/);
    if (match) {
      return { current: parseInt(match[1]), max: parseInt(match[2]) };
    }
    
    // Nếu chỉ có số
    const numMatch = participantInfo.match(/(\d+)/);
    if (numMatch) {
      return { current: parseInt(numMatch[1]), max: null };
    }
    
    return { current: 0, max: null };
  };

  const participants = parseParticipants(event.participantInfo);
  const eventStatus = event.status?.toLowerCase() || "";

  return (
    <TouchableOpacity
      style={styles.eventCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {showStatus && event.status && (
        <View style={styles.eventCardHeader}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(event.status) },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {getStatusLabel(event.status)}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
        </View>
      )}

      <Text style={styles.eventTitle}>{event.title || "Sự kiện"}</Text>
      {event.description && (
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
      )}

      <View style={styles.eventInfoRow}>
        <MaterialCommunityIcons name="calendar" size={16} color="#666" />
        <Text style={styles.eventInfoText}>{formatDate(event.eventDate)}</Text>
        <MaterialCommunityIcons
          name="clock-outline"
          size={16}
          color="#666"
          style={{ marginLeft: 12 }}
        />
        <Text style={styles.eventInfoText}>{formatTime(event.eventDate)}</Text>
      </View>

      {event.location && (
        <View style={styles.eventInfoRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
          <Text style={styles.eventInfoText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
      )}

      <View style={styles.eventFooter}>
        <View style={styles.participantsInfo}>
          <MaterialCommunityIcons
            name="account-group"
            size={18}
            color="#007AFF"
          />
          <Text style={styles.participantsText}>
            {participants.current > 0 ? participants.current : 0}
            {participants.max ? `/${participants.max}` : ""} người tham gia
          </Text>
        </View>

        {eventStatus === "upcoming" && (
          <TouchableOpacity 
            style={styles.joinButton} 
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation(); // Ngăn chặn trigger onPress của card
              if (onRegister) {
                onRegister(event.id);
              }
            }}
          >
            <Text style={styles.joinButtonText}>Đăng ký</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  eventTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  eventDescription: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    marginBottom: 16,
  },
  eventInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  eventInfoText: {
    ...typography.body,
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  participantsText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
  },
  joinButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default EventCard;
