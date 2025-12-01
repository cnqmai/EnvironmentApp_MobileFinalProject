package com.enviro.app.environment_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResponse {
    
    private UUID id;
    private String title;
    private String description; // <--- ĐÃ THÊM TRƯỜNG NÀY ĐỂ FIX LỖI BIÊN DỊCH
    private String location; // Thêm trường location để mapping từ Entity
    private UUID communityId;
    private String iconCode; 
    private OffsetDateTime eventDate;
    private String status;
    private String participantInfo;

    // Giả định constructor tạm thời cho việc Mocking trong Service
    public CampaignResponse(UUID id, String title, String iconCode, OffsetDateTime eventDate, String status, String participantInfo) {
        this.id = id;
        this.title = title;
        this.iconCode = iconCode;
        this.eventDate = eventDate;
        this.status = status;
        this.participantInfo = participantInfo;
        this.communityId = UUID.randomUUID(); 
    }
}