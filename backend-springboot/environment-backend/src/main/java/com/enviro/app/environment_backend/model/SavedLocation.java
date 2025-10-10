package com.enviro.app.environment_backend.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "saved_locations")
public class SavedLocation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Tên khu vực do người dùng đặt (ví dụ: "Nhà", "TP. HCM")
    @Column(nullable = false)
    private String name; 

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    // Liên kết với User (Khóa ngoại)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}