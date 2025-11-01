package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class QuizQuestionResponse {
    UUID id;
    String questionText;
    String optionA;
    String optionB;
    String optionC;
    String optionD;
    // Không trả về correctAnswer để user không biết đáp án trước
}

