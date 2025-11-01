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
    Integer score;
    Integer totalQuestions;
    BigDecimal percentage;
    Integer timeTakenSeconds;
    OffsetDateTime completedAt;
}

