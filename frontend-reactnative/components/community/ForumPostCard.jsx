import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar, IconButton, Divider } from 'react-native-paper';
import typography from '../../styles/typography';

// Hàm helper để format thời gian đơn giản
const formatTime = (timeString) => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + 
         ' lúc ' + 
         date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const ForumPostCard = ({ post, onLike, onComment, onPress }) => {
  // Dữ liệu giả lập phòng trường hợp post bị null
  const { 
    userFullName = "Người dùng ẩn danh", 
    userAvatarUrl, 
    content = "Nội dung bài viết...", 
    likesCount = 0, 
    commentsCount = 0, 
    isLikedByCurrentUser = false,
    createdAt 
  } = post || {};

  // State cục bộ để tạo hiệu ứng like ngay lập tức (optimistic update)
  const [liked, setLiked] = useState(isLikedByCurrentUser);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);

  const handleLike = () => {
    const newStatus = !liked;
    setLiked(newStatus);
    setLocalLikesCount(prev => newStatus ? prev + 1 : prev - 1);
    if (onLike) onLike();
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        {/* Header: Avatar + Tên + Thời gian */}
        <View style={styles.header}>
          {userAvatarUrl ? (
            <Avatar.Image size={40} source={{ uri: userAvatarUrl }} />
          ) : (
            <Avatar.Text size={40} label={userFullName.charAt(0).toUpperCase()} style={{backgroundColor: '#007bff'}} />
          )}
          
          <View style={styles.headerText}>
            <Text style={[typography.h3, styles.username]}>{userFullName}</Text>
            <Text style={[typography.small, styles.time]}>{formatTime(createdAt)}</Text>
          </View>
        </View>

        {/* Nội dung bài viết */}
        <Text style={[typography.body, styles.content]}>{content}</Text>
      </Card.Content>

      <Divider style={styles.divider} />

      {/* Hành động: Like, Comment */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <IconButton 
            icon={liked ? "heart" : "heart-outline"} 
            size={20} 
            iconColor={liked ? "#e74c3c" : "#666"} 
            style={{ margin: 0 }}
          />
          <Text style={[typography.small, { color: liked ? "#e74c3c" : "#666" }]}>
            {localLikesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <IconButton 
            icon="comment-outline" 
            size={20} 
            iconColor="#666" 
            style={{ margin: 0 }}
          />
          <Text style={[typography.small, styles.actionText]}>
            {commentsCount} bình luận
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 0, // Giao diện kiểu Facebook/Insta thường ít bo góc hơn
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
  content: {
    marginBottom: 8,
    lineHeight: 22,
    color: '#333',
  },
  divider: {
    marginTop: 8,
    backgroundColor: '#eee',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    color: '#666',
  }
});

export default ForumPostCard;