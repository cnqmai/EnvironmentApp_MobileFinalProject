import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Keyboard,
  Image,
  Share,
  RefreshControl,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import typography from "../../../styles/typography";
import { Video } from 'expo-av';

// Import service mới
import {
  fetchPostDetails,
  toggleLikePost,
  addCommentToPost,
  fetchPostComments,
  trackPostShare,
  fetchCurrentUser,
} from '../../../src/services/communityService';

// Helper để lấy chữ cái đầu
const getInitials = (fullName) => {
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
    return '?';
  }
  const parts = fullName.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
};


const PostDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);


  // --- LOGIC TẢI DỮ LIỆU CHÍNH (Tách ra để dùng cho Refresh) ---
  const fetchPostData = useCallback(async () => {
    if (!id) return;
    try {
      const postData = await fetchPostDetails(id);
      setPost(postData);
      const commentsData = await fetchPostComments(id);
      setComments(commentsData.map(c => ({ ...c, isLikedByCurrentUser: false })));
    } catch (e) {
      console.error("Lỗi tải chi tiết bài viết:", e.response?.data || e.message);
      Alert.alert("Lỗi", "Không thể tải chi tiết bài viết.");
      setPost(null);
      setComments([]);
    }
  }, [id]);


  // Hàm tải dữ liệu khi focus hoặc pull-to-refresh
  const loadInitialData = useCallback(async () => {
    if (!refreshing) {
      setLoading(true);
    }

    try {
      await fetchPostData();

      if (!currentUser) {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
      }
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchPostData, refreshing, currentUser]);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();

    }, [loadInitialData])
  );

  // --- HÀM XỬ LÝ PULL-TO-REFRESH ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInitialData();
  }, [loadInitialData]);
  // ------------------------------------


  // --- HÀM THẢ TIM BÀI VIẾT (FR-8.1.2) ---
  const handleLike = async () => {
    if (commentLoading || !post) return;

    try {
      const updatedPostResponse = await toggleLikePost(post.id);
      setPost(updatedPostResponse);
    } catch (e) {
      console.error("Lỗi thả tim:", e);
      Alert.alert("Lỗi", "Thao tác thả tim thất bại.");
    }
  };

  // --- HÀM ĐĂNG BÌNH LUẬN (FR-8.1.2) ---
  const handleComment = async () => {
    if (!commentText.trim() || commentLoading || !post || !currentUser) return;

    setCommentLoading(true);
    Keyboard.dismiss();

    try {
      const content = commentText.trim();
      await addCommentToPost(post.id, content);

      await fetchPostData();

      setCommentText("");
      setReplyingTo(null);

    } catch (e) {
      console.error("Lỗi đăng bình luận:", e.response?.data || e.message);
      Alert.alert("Lỗi", "Không thể đăng bình luận.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReply = (commentId, authorName) => {
    setReplyingTo({ id: commentId, author: authorName });
  };

  // --- HÀM CHIA SẺ (FR-8.1.2) ---
  const handleShare = async () => {
    const ngrokBaseUrl = "https://eructative-prodeportation-nikola.ngrok-free.dev";
    const internalPath = `/community/post/${post.id}`;
    const postUrl = `${ngrokBaseUrl}${internalPath}`;
    const message = `Hãy cùng xem mẹo sống xanh này: "${post.content.substring(0, 50)}..."`;

    try {
      const result = await Share.share({
        message: message,
        url: postUrl,
        title: 'Chia sẻ Mẹo Sống Xanh',
      });

      if (result.action === Share.sharedAction) {
        await trackPostShare(post.id);
        await fetchPostData();
      }
    } catch (error) {
      console.error('Lỗi khi chia sẻ:', error.message);
      Alert.alert('Lỗi', 'Không thể mở khung chia sẻ.');
    }
  };

  const totalComments = comments.length;

  // --- KIỂM TRA LOADING/NULL POST ---
  if (loading || post === null) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={["top"]}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 10, color: '#666' }}>Đang tải chi tiết bài viết...</Text>
          </>
        ) : (
          <Text style={{ marginTop: 10, color: '#E63946', fontSize: 16 }}>Không tìm thấy bài viết này.</Text>
        )}
      </SafeAreaView>
    );
  }

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      >
        {/* POST CONTENT */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarText}>{getInitials(post.userFullName)}</Text>
            </View>
            <View style={styles.authorInfo}>
              <View style={styles.authorRow}>
                <Text style={styles.authorName}>{post.userFullName}</Text>
              </View>
              <Text style={styles.postMeta} numberOfLines={1}>
                {new Date(post.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • Nhóm: {post.groupName || 'Chung'}
              </Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          {/* POST MEDIA (Đã sửa lỗi không xem được video bằng Component Video) */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <View style={styles.postMediaContainer}>
              {post.mediaUrls.map((url, index) => {
                // Kiểm tra đuôi file để phân biệt Video
                const isVideo = url.toLowerCase().match(/\.(mp4|mov|avi|wmv|flv|webm)$/);

                return (
                  <View
                    key={index}
                    style={[
                      styles.postImage,
                      post.mediaUrls.length > 1 && { height: 180, marginBottom: 8 }
                    ]}
                  >
                    {isVideo ? (
                      // Video Component (sử dụng expo-av/Video)
                      <Video
                        source={{ uri: url }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode="cover"
                        shouldPlay={false}
                        useNativeControls
                        style={styles.imagePlaceholder}
                      />
                    ) : (
                      // Image Render
                      <Image
                        source={{ uri: url }}
                        style={[styles.imagePlaceholder]}
                        resizeMode='cover'
                      />
                    )}
                  </View>
                )}
              )}
            </View>
          )}

          <View style={styles.postFooter}>
            <View style={styles.postStats}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={handleLike}
                disabled={commentLoading}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={post.isLikedByCurrentUser ? "heart" : "heart-outline"}
                  size={18}
                  color={post.isLikedByCurrentUser ? "#E63946" : "#666"}
                />
                <Text
                  style={[styles.statsText, post.isLikedByCurrentUser && styles.statsTextActive]}
                >
                  {post.likesCount}
                </Text>
              </TouchableOpacity>

              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name="comment-outline"
                  size={18}
                  color="#666"
                />
                <Text style={styles.statsText}>{post.commentsCount}</Text>
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
                <Text style={styles.statsText}>{post.sharesCount || 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* COMMENTS SECTION */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Bình luận ({post.commentsCount})</Text>

          {comments.length === 0 && !loading ? (
            <Text style={styles.noCommentsText}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
          ) : (
            comments.map((comment) => {
              const isLiked = comment.isLikedByCurrentUser;
              const likeCount = 0;
              const commentInitials = getInitials(comment.userFullName);

              return (
                <View key={comment.id}>
                  <View style={styles.commentCard}>
                    <View style={styles.commentAvatar}>
                      {/* Nếu Backend trả về URL avatar, dùng <Image> */}
                      <Text style={styles.commentAvatarText}>
                        {commentInitials}
                      </Text>
                    </View>
                    <View style={styles.commentContent}>
                      <View style={styles.commentBubble}>
                        <Text style={styles.commentAuthor}>{comment.userFullName}</Text>
                        <Text style={styles.commentText}>{comment.content}</Text>
                      </View>
                      <View style={styles.commentActions}>
                        <Text style={styles.commentTime}>
                          {new Date(comment.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
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
                            {/* Chỉ hiển thị số lượng nếu > 0 */}
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
                          // Tạm thời ẩn trả lời vì logic trả lời bình luận (replies) chưa có trong Comment Model
                          // onPress={() => handleReply(comment.id, comment.userFullName)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.commentActionText}>Trả lời</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* COMMENT INPUT FOOTER */}
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
            <Text style={styles.inputAvatarText}>{currentUser ? getInitials(currentUser.fullName) : '...'}</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder={
              commentLoading ? "Đang gửi..." : (replyingTo ? `Trả lời ${replyingTo.author}...` : "Viết bình luận...")
            }
            placeholderTextColor="#999"
            value={commentText}
            onChangeText={setCommentText}
            editable={!commentLoading}
          />
          <TouchableOpacity
            onPress={handleComment}
            disabled={!commentText.trim() || commentLoading}
            activeOpacity={0.7}
          >
            {commentLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <MaterialCommunityIcons
                name="arrow-up-circle"
                size={36}
                color={commentText.trim() ? "#007AFF" : "#D0D0D0"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (Styles giữ nguyên)
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
  postMediaContainer: {
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 240, // Default height
    borderRadius: 12,
    backgroundColor: "#E8E8E8",
    marginBottom: 8,
    resizeMode: 'cover',
  },
  imagePlaceholder: { // Dùng cho cả ảnh và video
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
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
  noCommentsText: {
    ...typography.body,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
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