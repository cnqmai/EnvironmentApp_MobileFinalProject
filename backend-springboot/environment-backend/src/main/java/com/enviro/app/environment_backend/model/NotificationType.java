package com.enviro.app.environment_backend.model;

/**
 * Enum định nghĩa các loại thông báo (FR-6.x)
 */
public enum NotificationType {
    CAMPAIGN,              // Chiến dịch môi trường địa phương (FR-6.1)
    COLLECTION_REMINDER,   // Nhắc nhở lịch thu gom rác tái chế (FR-6.2)
    WEATHER_ALERT,         // Cảnh báo thời tiết (FR-6.3)
    AQI_ALERT,             // Cảnh báo AQI vượt ngưỡng (FR-2.2.1)
    BADGE_EARNED,          // Đạt được badge mới
    REPORT_STATUS,         // Cập nhật trạng thái báo cáo
    GENERAL                // Thông báo chung
}

