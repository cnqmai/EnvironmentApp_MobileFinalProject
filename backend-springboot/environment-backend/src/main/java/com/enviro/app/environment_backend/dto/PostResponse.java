package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO trả về thông tin post (FR-8.1.1, FR-8.1.2)
 */
@Value
@Builder
public class PostResponse {
    
    UUID id;
    String content;
    
    // Thông tin user tạo post
    UUID userId;
    String userFullName;
    String userAvatarUrl;
    
    // Số lượng likes và comments
    long likesCount;
    long commentsCount;
    
    // User hiện tại đã like chưa
    boolean isLikedByCurrentUser;
    
    // Danh sách comments (optional - có thể null nếu không cần)
    List<CommentResponse> comments;
    
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}

