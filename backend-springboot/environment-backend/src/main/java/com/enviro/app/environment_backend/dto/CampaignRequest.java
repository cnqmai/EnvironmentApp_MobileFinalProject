package com.enviro.app.environment_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampaignRequest {

    private String title;
    private String description;
    private String location;
    
    // Sử dụng chuỗi ngày tháng theo định dạng ISO 8601 từ Frontend (VD: 2025-12-30T09:00:00+07:00)
    // Controller sẽ dùng String này để chuyển đổi sang OffsetDateTime
    private String eventDate; 
    
    // Số lượng tham gia tối đa (có thể là null)
    private Integer maxParticipants; 
    
    // Mã icon/ảnh
    private String iconCode;

    // Giả định: Người dùng sẽ tạo sự kiện cho một cộng đồng cụ thể
    // private UUID communityId; 
}