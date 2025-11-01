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
    List<MediaItem> media; 

    @Value // DTO nội bộ cho từng item media
    public static class MediaItem {
        @NotBlank
        String url;
        @NotBlank
        String type; // Ví dụ: "IMAGE" hoặc "VIDEO"
    }
}