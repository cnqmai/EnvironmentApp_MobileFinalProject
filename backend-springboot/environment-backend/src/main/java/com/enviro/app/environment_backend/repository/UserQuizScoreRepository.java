package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Quiz;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserQuizScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserQuizScoreRepository extends JpaRepository<UserQuizScore, UUID> {
    // Tìm kiếm bản ghi điểm số đã tồn tại của user cho bài quiz cụ thể
    Optional<UserQuizScore> findByUserAndQuiz(User user, Quiz quiz);
    
    // Xóa tất cả điểm quiz của user
    void deleteByUser(User user);
}