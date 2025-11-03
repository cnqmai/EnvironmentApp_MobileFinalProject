package com.enviro.app.environment_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Value;

/**
 * DTO trả về phản hồi từ Chatbot (FR-5.1)
 */
@Value
public class ChatbotResponse {
    
    UUID historyId;        // ID của lịch sử chat vừa tạo
    String userQuery;      // Câu hỏi của user
    String botResponse;    // Câu trả lời từ chatbot
    OffsetDateTime createdAt;

    // Explicit public constructor and getters to avoid Lombok builder dependency
    public ChatbotResponse(UUID historyId, String userQuery, String botResponse, OffsetDateTime createdAt) {
        this.historyId = historyId;
        this.userQuery = userQuery;
        this.botResponse = botResponse;
        this.createdAt = createdAt;
    }

    public UUID getHistoryId() { return historyId; }
    public String getUserQuery() { return userQuery; }
    public String getBotResponse() { return botResponse; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

