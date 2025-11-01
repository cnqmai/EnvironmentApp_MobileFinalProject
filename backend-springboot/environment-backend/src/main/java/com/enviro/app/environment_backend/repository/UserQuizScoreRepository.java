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
    
    List<UserQuizScore> findByUserOrderByCompletedAtDesc(User user);
    
    Optional<UserQuizScore> findByUserAndQuiz(User user, Quiz quiz);
    
    boolean existsByUserAndQuiz(User user, Quiz quiz);
}

