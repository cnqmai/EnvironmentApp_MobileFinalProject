package com.enviro.app.environment_backend.dto;

import lombok.Value;

import java.util.UUID;

@Value
public class RedeemRewardRequest {
    UUID rewardId;
}

