package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO trả về thông tin comment (FR-8.1.2)
 */
@Value
@Builder
public class CommentResponse {
    
    UUID id;
    String content;
    
    // Thông tin user tạo comment
    UUID userId;
    String userFullName;
    String userAvatarUrl;
    
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}

