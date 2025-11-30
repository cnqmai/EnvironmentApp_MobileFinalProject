// File: .../dto/ChatbotRequest.java
package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ChatbotRequest {
    @NotBlank(message = "Tin nhắn không được để trống")
    private String message;
    
    private String sessionId; // [MỚI] Gửi kèm ID hội thoại (nếu có)
}