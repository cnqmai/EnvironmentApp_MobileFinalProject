package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;

/**
 * DTO trả về thông tin badge (FR-9.1.2)
 */
@Value
@Builder
public class BadgeResponse {
    
    Integer id;
    String name;
    String description;
    String iconUrl;
    Integer requiredPoints;
    
    // Thông tin nếu user đã đạt được badge này
    boolean isEarned;
    OffsetDateTime earnedAt; // null nếu chưa đạt được
}

