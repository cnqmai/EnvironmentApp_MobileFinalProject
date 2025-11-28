package com.enviro.app.environment_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {
    private UUID historyId;
    private String userQuery;
    private String botResponse;
    private OffsetDateTime createdAt;
}