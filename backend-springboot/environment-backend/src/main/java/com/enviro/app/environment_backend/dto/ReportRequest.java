package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Value;
import java.util.List;

@Value
public class ReportRequest {
    
    @NotBlank(message = "Mô tả không được để trống")
    String description;
    
    @NotNull(message = "Vĩ độ không được để trống")
    Double latitude;
    
    @NotNull(message = "Kinh độ không được để trống")
    Double longitude;

    // Danh sách URL media đã upload trước (client upload trước khi gọi API này)
    // Có thể null hoặc empty nếu không có ảnh/video
    List<MediaItem> media; 

    // ID danh mục rác (optional - có thể null nếu chưa chọn danh mục)
    Long categoryId;

    @Value // DTO nội bộ cho từng item media
    public static class MediaItem {
        @NotBlank(message = "URL media không được để trống")
        String url;
        
        @NotBlank(message = "Loại media không được để trống")
        String type; // "image" hoặc "video" (lowercase để match với database enum)
    }
}