// File: .../dto/QuizScoreResponse.java
package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class QuizScoreResponse {
    UUID id;
    UUID quizId;
    String quizTitle;
    
    Integer correctCount;    // Sửa tên từ 'score' thành 'correctCount' cho rõ nghĩa hơn hoặc map đúng trong Service
    Integer totalQuestions;
    Integer pointsEarned;    // [MỚI] Thêm trường này
    
    BigDecimal percentage;
    Integer timeTakenSeconds;
    OffsetDateTime completedAt;
}