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
    private Long id; // ID danh mục

    @Column(nullable = false, unique = true)
    private String name; // Tên danh mục (ví dụ: "Rác thải nhựa")

    @Column(columnDefinition = "TEXT")
    private String description; // Mô tả chi tiết về danh mục

    // Bạn có thể thêm trường String iconUrl nếu muốn lưu trữ biểu tượng
}