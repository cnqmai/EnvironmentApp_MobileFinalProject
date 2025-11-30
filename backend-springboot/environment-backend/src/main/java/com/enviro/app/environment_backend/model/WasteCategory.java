package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "waste_categories")
public class WasteCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Hướng dẫn xử lý/vứt bỏ (Frontend hiển thị ở mục "Cách xử lý")
    @Column(name = "disposal_guideline", columnDefinition = "TEXT")
    private String disposalGuideline;

    // Hướng dẫn tái chế (Frontend hiển thị ở mục "Khả năng tái chế")
    @Column(name = "recycling_guideline", columnDefinition = "TEXT")
    private String recyclingGuideline;

    // Loại rác để Frontend map màu sắc/icon (ORGANIC, PLASTIC, METAL...)
    @Column(name = "collection_point_type")
    private String collectionPointType;

    private String iconUrl;
}