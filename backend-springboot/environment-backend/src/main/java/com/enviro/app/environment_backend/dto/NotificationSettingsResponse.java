package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;

/**
 * DTO trả về notification settings (FR-2.2.2)
 */
@Value
@Builder 
public class NotificationSettingsResponse {
    
    Boolean aqiAlertEnabled;
    Integer aqiThreshold;
    Boolean collectionReminderEnabled;
    Boolean campaignNotificationsEnabled;
    Boolean weatherAlertEnabled;
    Boolean badgeNotificationsEnabled;
    Boolean reportStatusNotificationsEnabled;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}