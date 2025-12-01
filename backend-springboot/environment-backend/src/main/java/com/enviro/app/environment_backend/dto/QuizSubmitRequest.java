// File: .../dto/QuizSubmitRequest.java
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
    private Map<UUID, Integer> answers; // questionId -> answer index (0=A, 1=B, 2=C, 3=D)
    private Integer timeTakenSeconds;
}