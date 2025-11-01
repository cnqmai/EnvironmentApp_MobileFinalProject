package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Like;
import com.enviro.app.environment_backend.model.LikeId;
import com.enviro.app.environment_backend.model.Post;
import com.enviro.app.environment_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, LikeId> {
    
    /**
     * Kiểm tra xem user đã like post chưa
     */
    boolean existsByUserAndPost(User user, Post post);
    
    /**
     * Tìm like theo user và post
     */
    Optional<Like> findByUserAndPost(User user, Post post);
    
    /**
     * Đếm số lượng likes của một post
     */
    long countByPost(Post post);
}

