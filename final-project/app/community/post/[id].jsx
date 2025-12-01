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
  const [commentLikes, setCommentLikes] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

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
      replies: [
        {
          id: 101,
          author: "Nguyễn Minh Anh",
          initials: "NMA",
          content: "Cảm ơn bạn! Hy vọng sẽ hữu ích cho bạn nhé 😊",
          time: "1 giờ trước",
          likes: 2,
        },
        {
          id: 102,
          author: "Trần Văn Nam",
          initials: "TVN",
          content: "Mình cũng đang thử nghiệm, hiệu quả lắm",
          time: "30 phút trước",
          likes: 1,
        },
      ],
    },
    {
      id: 2,
      author: "Lê Văn Cường",
      initials: "LVC",
      content: "Rất hữu ích! Mình sẽ thử áp dụng từ ngày mai",
      time: "1 giờ trước",
      likes: 3,
      replies: [],
    },
  ];

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleCommentLike = (commentId) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReply = (commentId, authorName) => {
    setReplyingTo({ id: commentId, author: authorName });
    setCommentText(`@${authorName} `);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      if (replyingTo) {
        console.log(`Replying to ${replyingTo.author}:`, commentText);
      } else {
        console.log("Adding comment:", commentText);
      }
      setCommentText("");
      setReplyingTo(null);
    }
  };

  const handleShare = () => {
    console.log("Sharing post");
  };

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);

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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarText}>{post.author.initials}</Text>
            </View>
            <View style={styles.authorInfo}>
              <View style={styles.authorRow}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                {post.author.badge && (
                  <View style={styles.badge}>
                    <MaterialCommunityIcons
                      name="star"
                      size={11}
                      color="#FFB800"
                    />
                    <Text style={styles.badgeText} numberOfLines={1}>
                      {post.author.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.postMeta} numberOfLines={1}>
                {post.date} • Nhóm: {post.community}
              </Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.postImage} />

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
                <Text
                  style={[styles.statsText, liked && styles.statsTextActive]}
                >
                  {post.likes + (liked ? 1 : 0)}
                </Text>
              </TouchableOpacity>

              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name="comment-outline"
                  size={18}
                  color="#666"
                />
                <Text style={styles.statsText}>{post.comments}</Text>
              </View>

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
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Bình luận ({totalComments})</Text>

          {comments.map((comment) => {
            const isLiked = commentLikes[comment.id];
            const likeCount = comment.likes + (isLiked ? 1 : 0);

            return (
              <View key={comment.id}>
                <View style={styles.commentCard}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.initials}
                    </Text>
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentBubble}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                    <View style={styles.commentActions}>
                      <Text style={styles.commentTime}>{comment.time}</Text>
                      <TouchableOpacity
                        style={styles.commentAction}
                        onPress={() => handleCommentLike(comment.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.commentActionWithIcon}>
                          <MaterialCommunityIcons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={14}
                            color={isLiked ? "#E63946" : "#666"}
                          />
                          {likeCount > 0 && (
                            <Text
                              style={[
                                styles.commentActionText,
                                isLiked && styles.commentActionTextActive,
                              ]}
                            >
                              {likeCount}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.commentAction}
                        onPress={() => handleReply(comment.id, comment.author)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.commentActionText}>Trả lời</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Render replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <View style={styles.repliesContainer}>
                    {comment.replies.map((reply) => {
                      const isReplyLiked = commentLikes[reply.id];
                      const replyLikeCount =
                        reply.likes + (isReplyLiked ? 1 : 0);

                      return (
                        <View key={reply.id} style={styles.replyCard}>
                          <View style={styles.commentAvatar}>
                            <Text style={styles.commentAvatarText}>
                              {reply.initials}
                            </Text>
                          </View>
                          <View style={styles.commentContent}>
                            <View style={styles.commentBubble}>
                              <Text style={styles.commentAuthor}>
                                {reply.author}
                              </Text>
                              <Text style={styles.commentText}>
                                {reply.content}
                              </Text>
                            </View>
                            <View style={styles.commentActions}>
                              <Text style={styles.commentTime}>
                                {reply.time}
                              </Text>
                              <TouchableOpacity
                                style={styles.commentAction}
                                onPress={() => handleCommentLike(reply.id)}
                                activeOpacity={0.7}
                              >
                                <View style={styles.commentActionWithIcon}>
                                  <MaterialCommunityIcons
                                    name={
                                      isReplyLiked ? "heart" : "heart-outline"
                                    }
                                    size={14}
                                    color={isReplyLiked ? "#E63946" : "#666"}
                                  />
                                  {replyLikeCount > 0 && (
                                    <Text
                                      style={[
                                        styles.commentActionText,
                                        isReplyLiked &&
                                          styles.commentActionTextActive,
                                      ]}
                                    >
                                      {replyLikeCount}
                                    </Text>
                                  )}
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.commentAction}
                                onPress={() =>
                                  handleReply(comment.id, reply.author)
                                }
                                activeOpacity={0.7}
                              >
                                <Text style={styles.commentActionText}>
                                  Trả lời
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        {replyingTo && (
          <View style={styles.replyingBanner}>
            <Text style={styles.replyingText}>
              Đang trả lời {replyingTo.author}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setReplyingTo(null);
                setCommentText("");
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <View style={styles.commentInputAvatar}>
            <Text style={styles.inputAvatarText}>BAN</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder={
              replyingTo
                ? `Trả lời ${replyingTo.author}...`
                : "Viết bình luận..."
            }
            placeholderTextColor="#999"
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity
            onPress={handleComment}
            disabled={!commentText.trim()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={36}
              color={commentText.trim() ? "#007AFF" : "#D0D0D0"}
            />
          </TouchableOpacity>
        </View>
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
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#F0EFED",
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
    letterSpacing: -0.3,
  },
  moreButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  postCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  authorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
    flexWrap: "wrap",
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
    maxWidth: 200,
  },
  badgeText: {
    ...typography.small,
    fontSize: 10,
    fontWeight: "600",
    color: "#FFB800",
    flexShrink: 1,
  },
  postMeta: {
    ...typography.small,
    fontSize: 12,
    color: "#666",
  },
  postContent: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    backgroundColor: "#E8E8E8",
    marginBottom: 12,
  },
  postFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 2,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
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

  commentsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  commentsTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 12,
  },
  commentCard: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 10,
  },
  repliesContainer: {
    marginLeft: 46,
    marginBottom: 8,
  },
  replyCard: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  commentAuthor: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 3,
  },
  commentText: {
    ...typography.body,
    fontSize: 14,
    color: "#0A0A0A",
    lineHeight: 19,
  },
  commentActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
  },
  commentTime: {
    ...typography.small,
    fontSize: 11,
    color: "#999",
  },
  commentAction: {
    paddingHorizontal: 3,
  },
  commentActionWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    ...typography.small,
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  commentActionTextActive: {
    color: "#007AFF",
  },

  commentInputContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 5,
  },
  replyingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 12,
  },
  replyingText: {
    ...typography.small,
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
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
});

export default PostDetailScreen;
