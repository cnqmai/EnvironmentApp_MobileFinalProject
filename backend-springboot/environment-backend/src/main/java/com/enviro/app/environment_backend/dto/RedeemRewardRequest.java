package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class RedeemRewardRequest {
    @NotNull(message = "Reward ID cannot be null")
    private UUID rewardId;

    // Default constructor
    public RedeemRewardRequest() {}

    // Constructor with fields
    public RedeemRewardRequest(UUID rewardId) {
        this.rewardId = rewardId;
    }

    // Getters and Setters
    public UUID getRewardId() {
        return rewardId;
    }

    public void setRewardId(UUID rewardId) {
        this.rewardId = rewardId;
    }
}