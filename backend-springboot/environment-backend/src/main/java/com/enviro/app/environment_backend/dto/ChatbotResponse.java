// File: .../dto/ChatbotResponse.java
package com.enviro.app.environment_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Value;

@Value
public class ChatbotResponse {
    UUID historyId;
    String sessionId; // [MỚI]
    String userQuery;
    String botResponse;
    OffsetDateTime createdAt;
}