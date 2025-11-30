import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../../styles/typography";

const PostDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Mock data
  const post = {
    id: id,
    author: {
      name: "Nguyễn Minh Anh",
      initials: "NMA",
      badge: "Chiến binh môi trường",
    },
    community: "Sống xanh Sài Gòn",
    content: `Hôm nay mình đã tham gia dọn dẹp công viên cùng nhóm. Thu được gần 50kg rác! Cảm thấy rất vui và ý nghĩa 🌿 Cảm ơn tất cả mọi người đã tham gia! Hẹn gặp lại ở hoạt động tiếp theo!`,
    date: "2 giờ trước",
    likes: 124,
    comments: 18,
    shares: 5,
  };

  const comments = [
    {
      id: 1,
      author: "Phạm Thị Lan",
      initials: "PTL",
      content: "Cảm ơn bạn đã chia sẻ! Mình cũng đang áp dụng những mẹo này",
      time: "2 giờ trước",
      likes: 5,
    },
    {
      id: 2,
      author: "Lê Văn Cường",
      initials: "LVC",
      content: "Rất hữu ích! Mình sẽ thử áp dụng từ ngày mai",
      time: "1 giờ trước",
      likes: 3,
    },
  ];

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      console.log("Adding comment:", commentText);
      setCommentText("");
    }
  };

  const handleShare = () => {
    console.log("Sharing post");
  };

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
        <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color="#0A0A0A"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.postCard}>
          <View style={styles.authorSection}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons
                name={post.author.avatar}
                size={40}
                color="#0A0A0A"
              />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <Text style={styles.authorRole}>{post.author.role}</Text>
              <Text style={styles.postTime}>
                {post.date} • {post.time}
              </Text>
            </View>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>

          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={liked ? "heart" : "heart-outline"}
                size={24}
                color={liked ? "#FF3B30" : "#666"}
              />
              <Text
                style={[styles.actionText, liked && styles.actionTextActive]}
              >
                {post.likes + (liked ? 1 : 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="comment-outline"
                size={24}
                color="#666"
              />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={24}
                color="#666"
              />
              <Text style={styles.actionText}>{post.shares}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Bình luận ({comments.length})
          </Text>

          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentAvatar}>
                <MaterialCommunityIcons
                  name={comment.avatar}
                  size={32}
                  color="#0A0A0A"
                />
              </View>
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  <Text style={styles.commentTime}>{comment.time}</Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    style={styles.commentAction}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="heart-outline"
                      size={16}
                      color="#666"
                    />
                    <Text style={styles.commentActionText}>
                      {comment.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.commentAction}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.commentActionText}>Trả lời</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <View style={styles.commentInputAvatar}>
          <MaterialCommunityIcons
            name="emoticon-happy-outline"
            size={32}
            color="#0A0A0A"
          />
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder="Viết bình luận..."
          placeholderTextColor="#999"
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            commentText.trim() && styles.sendButtonActive,
          ]}
          onPress={handleComment}
          disabled={!commentText.trim()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={commentText.trim() ? "#FFFFFF" : "#999"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#F0EFED",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  moreButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  postCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    padding: 20,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  authorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  authorName: {
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
    marginBottom: 16,
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    marginBottom: 16,
  },
  postFooter: {
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
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
  actionTextActive: {
    color: "#E63946",
  },

  commentsSection: {
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    padding: 20,
  },
  commentsTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 16,
  },
  commentCard: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  commentAuthor: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 4,
  },
  commentText: {
    ...typography.body,
    fontSize: 14,
    color: "#0A0A0A",
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12,
  },
  commentTime: {
    ...typography.small,
    fontSize: 12,
    color: "#999",
  },
  commentAction: {
    paddingHorizontal: 4,
  },
  commentActionText: {
    ...typography.small,
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },

  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 12,
  },
  commentInputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  inputAvatarText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  commentInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: "#0A0A0A",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#007AFF",
  },
});

export default PostDetailScreen;
