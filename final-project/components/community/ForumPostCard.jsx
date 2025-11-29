import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import typography from "../../styles/typography";

const ForumPostCard = ({ post, onPress }) => {
  const getInitials = (name) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <TouchableOpacity
      style={styles.postCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.postHeader}>
        <View style={styles.postAuthorAvatar}>
          <Text style={styles.avatarText}>{getInitials(post.author)}</Text>
        </View>
        <View style={styles.postAuthorInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.postAuthorName}>{post.author}</Text>
            {post.badge && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="star" size={10} color="#FFB800" />
                <Text style={styles.badgeText}>{post.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.postMeta}>
            {post.date} • Nhóm: {post.community}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.image && <View style={styles.postImage} />}

      <View style={styles.postFooter}>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="heart-outline"
              size={20}
              color="#666"
            />
            <Text style={styles.actionText}>Thích</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={20}
              color="#666"
            />
            <Text style={styles.actionText}>Bình luận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="share-outline"
              size={20}
              color="#666"
            />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.postStats}>
          <MaterialCommunityIcons name="heart" size={16} color="#E63946" />
          <Text style={styles.statsText}>{post.likes} lượt thích</Text>
          <Text style={styles.statsSeparator}>•</Text>
          <Text style={styles.statsText}>{post.comments} bình luận</Text>
          {post.shares > 0 && (
            <>
              <Text style={styles.statsSeparator}>•</Text>
              <Text style={styles.statsText}>{post.shares} chia sẻ</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  postAuthorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  postAuthorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  postAuthorName: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    ...typography.small,
    fontSize: 11,
    fontWeight: "600",
    color: "#FFB800",
  },
  postMeta: {
    ...typography.small,
    fontSize: 13,
    color: "#666",
  },
  postContent: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    lineHeight: 22,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  postFooter: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statsText: {
    ...typography.small,
    fontSize: 13,
    color: "#666",
  },
  statsSeparator: {
    ...typography.small,
    fontSize: 13,
    color: "#CCC",
  },
});

export default ForumPostCard;
