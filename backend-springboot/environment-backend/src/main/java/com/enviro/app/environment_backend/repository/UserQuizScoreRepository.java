package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Quiz;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserQuizScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserQuizScoreRepository extends JpaRepository<UserQuizScore, UUID> {
    
    // Lấy danh sách điểm của user
    List<UserQuizScore> findByUserOrderByCompletedAtDesc(User user);
    
    // Tìm điểm của user cho một quiz cụ thể
    Optional<UserQuizScore> findByUserAndQuiz(User user, Quiz quiz);
    
    // Kiểm tra xem user đã làm quiz này chưa
    boolean existsByUserAndQuiz(User user, Quiz quiz);
}