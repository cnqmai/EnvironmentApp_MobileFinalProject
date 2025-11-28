package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho yêu cầu gửi câu hỏi đến Chatbot (FR-5.1)
 */
@Data // Thay @Value bằng @Data để có Getter/Setter và mutable
@NoArgsConstructor // Cần thiết cho Jackson deserialization
@AllArgsConstructor
public class ChatbotRequest {
    
    @NotBlank(message = "Câu hỏi không được để trống")
    private String message; // Câu hỏi của user
}