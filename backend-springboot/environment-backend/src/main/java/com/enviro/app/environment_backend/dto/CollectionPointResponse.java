package com.enviro.app.environment_backend.dto;

import com.enviro.app.environment_backend.model.CollectionPointType;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO trả về thông tin collection point (FR-10.1.1, FR-10.1.2)
 */
@Value
@Builder
public class CollectionPointResponse {
    
    UUID id;
    String name;
    CollectionPointType type;
    double latitude;
    double longitude;
    String address;
    String description;
    String phoneNumber;
    String openingHours;
    Boolean isActive;
    
    // Khoảng cách từ vị trí hiện tại (km) - chỉ có khi query nearby
    Double distanceKm;
    
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}

