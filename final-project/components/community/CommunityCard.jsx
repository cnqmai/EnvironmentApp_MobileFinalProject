import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import typography from "../../styles/typography";

const CommunityCard = ({ community, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.communityCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.communityHeader}>
        <View style={styles.communityIconContainer}>
          <MaterialCommunityIcons
            name="shield-check"
            size={32}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.communityHeaderContent}>
          <Text style={styles.communityName}>{community.name}</Text>
          <Text style={styles.communityMembers}>
            {community.members} thành viên
          </Text>
        </View>
      </View>

      <View style={styles.communityStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{community.campaigns}</Text>
          <Text style={styles.statLabel}>Chiến dịch</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{community.recycledWeight}kg</Text>
          <Text style={styles.statLabel}>Rác tái chế</Text>
        </View>
      </View>

      {community.joined ? (
        <View style={styles.communityActions}>
          {community.following && (
            <View style={styles.followingBadge}>
              <MaterialCommunityIcons name="bell" size={12} color="#007AFF" />
              <Text style={styles.followingText}>Đang theo dõi</Text>
            </View>
          )}
          <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
        </View>
      ) : (
        <TouchableOpacity style={styles.joinButton} activeOpacity={0.8}>
          <MaterialCommunityIcons
            name="account-plus"
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.joinButtonText}>Tham gia</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  communityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  communityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  communityHeaderContent: {
    flex: 1,
  },
  communityName: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  communityMembers: {
    ...typography.small,
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  communityStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 4,
  },
  statLabel: {
    ...typography.small,
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  communityActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  followingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
  },
  followingText: {
    ...typography.small,
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  joinButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default CommunityCard;
