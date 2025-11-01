package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Dùng Long cho ID báo cáo

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Khóa ngoại liên kết với người dùng

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description; // Mô tả vấn đề

    @Column(nullable = false)
    private double latitude; // Vĩ độ GPS

    @Column(nullable = false)
    private double longitude; // Kinh độ GPS

    @Enumerated(EnumType.STRING) // Lưu Enum dưới dạng chuỗi
    @Column(nullable = false)
    private ReportStatus status; // Trạng thái hiện tại của báo cáo

    // Liên kết với ReportMedia (một-nhiều)
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReportMedia> reportMedia; 
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = true) // Cho phép null tạm thời
    private WasteCategory wasteCategory;
    
    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}