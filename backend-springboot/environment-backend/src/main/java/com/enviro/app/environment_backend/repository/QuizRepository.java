package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    
    List<Quiz> findByIsActiveTrueOrderByCreatedAtDesc();
    
    List<Quiz> findByDifficultyAndIsActiveTrueOrderByCreatedAtDesc(String difficulty);
}

