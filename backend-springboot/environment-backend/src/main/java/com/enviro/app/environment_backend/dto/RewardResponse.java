package com.enviro.app.environment_backend.dto;

import com.enviro.app.environment_backend.model.RewardType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class RewardResponse {
    UUID id;
    String name;
    String description;
    RewardType type;
    Integer pointsCost;
    String imageUrl;
    Integer discountPercent;
    Integer quantityAvailable;
    LocalDate expiryDate;
    OffsetDateTime createdAt;
}

