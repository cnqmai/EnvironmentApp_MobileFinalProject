package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    
    /**
     * Lấy tất cả posts, sắp xếp theo thời gian mới nhất
     */
    List<Post> findAllByOrderByCreatedAtDesc();
    
    /**
     * Lấy posts của một user cụ thể
     */
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    List<Post> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
    
    /**
     * Đếm số lượng posts có chứa "tái chế" trong nội dung (FR-12.1.2)
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    long countByContentContaining(@Param("keyword") String keyword);
    
    /**
     * Xóa tất cả posts của user
     */
    @Modifying
    @Query("DELETE FROM Post p WHERE p.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}

