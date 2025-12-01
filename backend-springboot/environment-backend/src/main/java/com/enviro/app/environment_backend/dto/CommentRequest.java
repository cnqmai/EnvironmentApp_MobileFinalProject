package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data; // [CẬP NHẬT QUAN TRỌNG] Thay thế @Value bằng @Data
import lombok.NoArgsConstructor; // [BỔ SUNG] Cần có constructor không tham số cho Jackson
import lombok.AllArgsConstructor; // [BỔ SUNG] Cần có constructor cho tất cả các trường

import java.util.List;
import java.util.UUID;

/**
 * DTO cho yêu cầu thêm bình luận
 */
@Data // Cung cấp getter/setter và các constructor cần thiết cho Jackson
@NoArgsConstructor 
@AllArgsConstructor
public class CommentRequest {
    
    @NotBlank(message = "Nội dung bình luận không được để trống")
    String content;
}