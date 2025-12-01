package com.enviro.app.environment_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {
    private UUID quizId;
    private Map<UUID, Integer> answers; // Key: questionId (UUID), Value: index đáp án (0,1,2,3)
    private Integer timeTakenSeconds;
}