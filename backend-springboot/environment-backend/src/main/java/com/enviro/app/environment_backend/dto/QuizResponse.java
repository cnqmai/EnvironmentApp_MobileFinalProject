package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class QuizResponse {
    UUID id;
    String title;
    String description;
    String difficulty;
    Integer timeLimitMinutes;
    Integer questionCount;
    List<QuizQuestionResponse> questions;
    OffsetDateTime createdAt;
}

