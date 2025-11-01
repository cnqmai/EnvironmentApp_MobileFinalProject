package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class DailyTipResponse {
    UUID id;
    String title;
    String description;
    String category;
    String iconUrl;
    String actionText;
    Integer pointsReward;
    LocalDate displayDate;
    OffsetDateTime createdAt;
}

