import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import typography from "../../styles/typography";

const ForumPostCard = ({ post, onPress }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const getInitials = (name) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    if (onPress) onPress();
  };

  const handleShare = (e) => {
    e.stopPropagation();
    console.log("Share post:", post.id);
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
                <MaterialCommunityIcons name="star" size={11} color="#FFB800" />
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
        <View style={styles.postStats}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? "#E63946" : "#666"}
            />
            <Text style={[styles.statsText, liked && styles.statsTextActive]}>
              {likeCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={handleComment}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="comment-outline"
              size={18}
              color="#666"
            />
            <Text style={styles.statsText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="share-outline"
              size={18}
              color="#666"
            />
            <Text style={styles.statsText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    gap: 14,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  postAuthorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.body,
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  postAuthorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  postAuthorName: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
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
    color: "#999",
    lineHeight: 18,
  },
  postContent: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    lineHeight: 23,
  },
  postImage: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    backgroundColor: "#E8E8E8",
    marginTop: 4,
  },
  postFooter: {
    gap: 14,
    paddingTop: 12,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statsText: {
    ...typography.small,
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  statsTextActive: {
    color: "#E63946",
    fontWeight: "600",
  },
});

export default ForumPostCard;
