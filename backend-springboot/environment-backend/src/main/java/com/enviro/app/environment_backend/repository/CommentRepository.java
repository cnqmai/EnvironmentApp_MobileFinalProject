package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Comment;
import com.enviro.app.environment_backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    
    /**
     * Lấy tất cả comments của một post, sắp xếp theo thời gian mới nhất
     */
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);
}

