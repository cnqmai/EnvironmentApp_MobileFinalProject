package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO trả về phản hồi từ Chatbot (FR-5.1)
 */
@Value
@Builder
public class ChatbotResponse {
    
    UUID historyId;        // ID của lịch sử chat vừa tạo
    String userQuery;      // Câu hỏi của user
    String botResponse;    // Câu trả lời từ chatbot
    OffsetDateTime createdAt;
}

