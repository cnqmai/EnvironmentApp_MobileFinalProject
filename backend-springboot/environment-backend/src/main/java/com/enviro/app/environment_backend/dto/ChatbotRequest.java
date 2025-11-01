package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Value;

/**
 * DTO cho yêu cầu gửi câu hỏi đến Chatbot (FR-5.1)
 */
@Value
public class ChatbotRequest {
    
    @NotBlank(message = "Câu hỏi không được để trống")
    String message; // Câu hỏi của user
}

