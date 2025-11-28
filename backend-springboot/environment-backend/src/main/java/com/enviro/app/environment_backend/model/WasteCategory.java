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
    private String name; // Ví dụ: "Rác hữu cơ"

    @Column(nullable = false, unique = true)
    private String slug; // Dùng để map với frontend (organic, recyclable, hazardous...)

    private String subtitle; // Ví dụ: "Thực phẩm thừa, vỏ trái cây..."

    @Column(columnDefinition = "TEXT")
    private String guidelines; // Hướng dẫn xử lý (Các bước phân tách bằng dấu xuống dòng \n)

    @Column(columnDefinition = "TEXT")
    private String description;

    // Màu sắc đại diện (nếu muốn lưu DB luôn thay vì switch-case ở frontend)
    private String backgroundColorCode; 
}