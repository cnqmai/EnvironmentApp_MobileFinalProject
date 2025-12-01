package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class QuizResponse {
    UUID id;
    String title;
    String description;
    Integer timeLimitMinutes;
    List<QuizQuestionResponse> questions; // Danh sách câu hỏi
}