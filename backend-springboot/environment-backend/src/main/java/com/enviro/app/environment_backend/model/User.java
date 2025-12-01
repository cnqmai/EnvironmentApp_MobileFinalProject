package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String fullName;

    private String avatarUrl;

    private String defaultLocation;

    @Column(columnDefinition = "integer default 0")
    private int points;
    
    @Column(name = "classification_count", columnDefinition = "integer default 0")
    private int classificationCount = 0;
    
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String phoneNumber;
    
    @Column(name = "unread_notification_count", columnDefinition = "integer default 0")
    private int unreadNotificationCount = 0; 

    @Column(name = "share_personal_data", columnDefinition = "boolean default false")
    private boolean sharePersonalData = false; 
    
    @Column(name = "share_location", columnDefinition = "boolean default false")
    private boolean shareLocation = false; 

    @Column(name = "enabled", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean enabled = false; 

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}