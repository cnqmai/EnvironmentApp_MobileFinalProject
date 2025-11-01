package com.enviro.app.environment_backend.dto;

import lombok.Value;

/**
 * DTO cho yêu cầu cập nhật notification settings (FR-2.2.2)
 */
@Value
public class NotificationSettingsRequest {
    
    Boolean aqiAlertEnabled;
    Integer aqiThreshold; // Ngưỡng AQI để gửi cảnh báo
    Boolean collectionReminderEnabled;
    Boolean campaignNotificationsEnabled;
    Boolean weatherAlertEnabled;
    Boolean badgeNotificationsEnabled;
    Boolean reportStatusNotificationsEnabled;
}

