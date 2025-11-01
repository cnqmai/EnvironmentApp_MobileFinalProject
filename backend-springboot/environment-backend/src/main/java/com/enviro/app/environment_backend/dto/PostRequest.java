package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Value;

/**
 * DTO cho yêu cầu tạo bài viết (FR-8.1.1)
 */
@Value
public class PostRequest {
    
    @NotBlank(message = "Nội dung bài viết không được để trống")
    String content;
}

