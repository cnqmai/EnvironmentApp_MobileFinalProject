package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;

// --- Lombok Annotations ---
@Data // Tự động tạo getters, setters, toString, equals, hashCode
@Builder // Hỗ trợ tạo đối tượng theo Builder pattern
@NoArgsConstructor // Tự động tạo constructor không tham số
@AllArgsConstructor // Tự động tạo constructor có tất cả tham số

// --- JPA Annotations ---
@Entity // Đánh dấu đây là một Entity, sẽ được map với một bảng trong DB
@Table(name = "users") // Chỉ định tên của bảng trong DB là "users"
public class User {

    @Id // Đánh dấu đây là khóa chính
    @GeneratedValue(strategy = GenerationType.UUID) // Tự động sinh giá trị UUID cho khóa chính
    private UUID id;

    @Column(unique = true, nullable = false) // Cột này là duy nhất và không được null
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String fullName;

    private String avatarUrl;

    private String defaultLocation;

    @Column(columnDefinition = "integer default 0") // Đặt giá trị mặc định cho cột
    private int points;

    @CreationTimestamp // Tự động gán giá trị thời gian khi một đối tượng được tạo
    private OffsetDateTime createdAt;

    @UpdateTimestamp // Tự động gán giá trị thời gian khi một đối tượng được cập nhật
    private OffsetDateTime updatedAt;

    // Bạn sẽ thêm các mối quan hệ với các bảng khác (như Report, Post) ở đây sau
}