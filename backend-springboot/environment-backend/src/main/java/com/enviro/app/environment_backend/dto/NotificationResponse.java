package com.enviro.app.environment_backend.dto;

import com.enviro.app.environment_backend.model.NotificationStatus;
import com.enviro.app.environment_backend.model.NotificationType;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO trả về thông tin notification (FR-6.x)
 */
@Value
@Builder
public class NotificationResponse {
    
    UUID id;
    String title;
    String message;
    NotificationType type;
    NotificationStatus status;
    String relatedId;
    OffsetDateTime createdAt;
}

