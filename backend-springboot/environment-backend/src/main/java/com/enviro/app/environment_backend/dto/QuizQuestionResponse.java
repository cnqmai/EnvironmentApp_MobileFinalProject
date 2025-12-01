package com.enviro.app.environment_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuizQuestionResponse {
    private UUID id;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    
    private String correctAnswer; 
    private String explanation;   
    private Integer orderNumber;  
}