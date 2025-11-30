package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "report_media")
public class ReportMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Dùng Long (BIGSERIAL) thay vì UUID để khớp với database

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Report report; // Khóa ngoại liên kết với Report

    @Column(name = "media_url", nullable = false)
    private String mediaUrl; // URL ảnh/video (ví dụ: S3, Cloudinary)

    @Column(name = "type", nullable = false)
    private String mediaType; // Loại file: "image" hoặc "video" (lowercase để khớp với enum trong database)

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private OffsetDateTime uploadedAt;
}