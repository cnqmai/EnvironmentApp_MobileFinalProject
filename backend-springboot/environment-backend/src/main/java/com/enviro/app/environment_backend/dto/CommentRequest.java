package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Value;

/**
 * DTO cho yêu cầu thêm bình luận (FR-8.1.2)
 */
@Value
public class CommentRequest {
    
    @NotBlank(message = "Nội dung bình luận không được để trống")
    String content;
}

