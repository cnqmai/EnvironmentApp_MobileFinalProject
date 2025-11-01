package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_settings")
public class NotificationSettings {

    @Id
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "aqi_alert_enabled", nullable = false)
    @Builder.Default
    private Boolean aqiAlertEnabled = true;

    @Column(name = "aqi_threshold", nullable = false)
    @Builder.Default
    private Integer aqiThreshold = 100;

    @Column(name = "collection_reminder_enabled", nullable = false)
    @Builder.Default
    private Boolean collectionReminderEnabled = true;

    @Column(name = "campaign_notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean campaignNotificationsEnabled = true;

    @Column(name = "weather_alert_enabled", nullable = false)
    @Builder.Default
    private Boolean weatherAlertEnabled = true;

    @Column(name = "badge_notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean badgeNotificationsEnabled = true;

    @Column(name = "report_status_notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean reportStatusNotificationsEnabled = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

