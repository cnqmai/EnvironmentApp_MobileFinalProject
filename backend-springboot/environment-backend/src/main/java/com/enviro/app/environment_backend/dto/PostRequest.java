package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Value;

import java.util.List;
import java.util.UUID;

/**
 * DTO cho yêu cầu tạo bài viết (FR-8.1.1)
 */
@Value
public class PostRequest {
    
    @NotBlank(message = "Nội dung bài viết không được để trống")
    String content;
    
    // ID của nhóm cộng đồng (null nếu đăng lên cộng đồng chung)
    UUID groupId; 
    
    // Danh sách URL ảnh/video đã được upload lên server trước đó (FR-8.1.1)
    List<String> mediaUrls;
}