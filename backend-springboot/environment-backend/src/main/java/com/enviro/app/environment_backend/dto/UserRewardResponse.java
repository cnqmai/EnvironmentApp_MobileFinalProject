package com.enviro.app.environment_backend.dto;

import com.enviro.app.environment_backend.model.RewardType;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class UserRewardResponse {
    UUID id;
    UUID rewardId;
    String rewardName;
    RewardType rewardType;
    String voucherCode;
    String status;
    OffsetDateTime redeemedAt;
    OffsetDateTime usedAt;
    OffsetDateTime expiresAt;
}

