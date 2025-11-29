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
    
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String phoneNumber;
    
    @Column(name = "unread_notification_count", columnDefinition = "integer default 0")
    private int unreadNotificationCount = 0; // Khởi tạo giá trị mặc định là 0

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}