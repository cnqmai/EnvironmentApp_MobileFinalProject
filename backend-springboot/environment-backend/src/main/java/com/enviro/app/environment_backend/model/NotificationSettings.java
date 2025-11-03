package com.enviro.app.environment_backend.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn; // Import UUID
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_settings")
public class NotificationSettings {

    // FIX 1: The actual primary key field, matching the ID type of the User entity.
    @Id
    private UUID userId;

    // FIX 2: @MapsId signals that the primary key of this entity (userId) is
    // derived from the primary key of the associated entity (User).
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // Maps the PK of this entity (userId) to the foreign key column (user_id)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Removed @Id from here

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