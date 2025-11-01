package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "report_media")
public class ReportMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report; // Khóa ngoại liên kết với Report

    @Column(nullable = false)
    private String mediaUrl; // URL ảnh/video (ví dụ: S3, Cloudinary)

    @Column(nullable = false)
    private String mediaType; // Loại file (ví dụ: "IMAGE", "VIDEO")
}