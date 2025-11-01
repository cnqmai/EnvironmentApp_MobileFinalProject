package com.enviro.app.environment_backend.dto;

import lombok.Value;

import java.util.Map;
import java.util.UUID;

@Value
public class QuizSubmitRequest {
    UUID quizId;
    Map<UUID, String> answers; // questionId -> answer ('A', 'B', 'C', 'D')
    Integer timeTakenSeconds;
}

