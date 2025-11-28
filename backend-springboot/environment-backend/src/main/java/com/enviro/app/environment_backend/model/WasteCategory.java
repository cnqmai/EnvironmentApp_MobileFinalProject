// File: src/main/java/com/enviro/app/environment_backend/model/WasteCategory.java
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
    private String name; // Ví dụ: "Rác thải nhựa"

    @Column(columnDefinition = "TEXT")
    private String description; // Mô tả

    // [MỚI] Hướng dẫn xử lý (VD: "Rửa sạch, phơi khô...")
    @Column(name = "disposal_guideline", columnDefinition = "TEXT")
    private String disposalGuideline;

    // [MỚI] Hướng dẫn tái chế (VD: "Có thể tái chế thành chậu cây...")
    @Column(name = "recycling_guideline", columnDefinition = "TEXT")
    private String recyclingGuideline;

    // [MỚI] Loại điểm thu gom tương ứng (để liên kết với WasteCollectionPoint)
    // Giá trị này nên khớp với Enum CollectionPointType (VD: "PLASTIC", "ORGANIC")
    @Column(name = "collection_point_type")
    private String collectionPointType;

    private String iconUrl;
}