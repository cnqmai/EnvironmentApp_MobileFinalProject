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
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // --- CÁC TRƯỜNG MỚI CHO CHỨC NĂNG CỘNG ĐỒNG (FR-8.1.1) ---

    // Liên kết Post với CommunityGroup (tùy chọn, post có thể là public/chung)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id") // group_id có thể null
    private CommunityGroup group;

    // Danh sách URL ảnh/video (FR-8.1.1)
    @ElementCollection
    @CollectionTable(name = "post_media", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "media_url", columnDefinition = "TEXT")
    private List<String> mediaUrls;

    // Liên kết với Comments (một-nhiều)
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    // Liên kết với Likes (một-nhiều)
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes;

    // [BỔ SUNG] Số lượng chia sẻ
    @Column(name = "shares_count")
    @Builder.Default
    private Integer sharesCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}