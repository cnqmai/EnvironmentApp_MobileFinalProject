package com.enviro.app.environment_backend.dto;

import com.fasterxml.jackson.annotation.JsonCreator; // Cần thiết
import com.fasterxml.jackson.annotation.JsonProperty; // Cần thiết cho constructor
import jakarta.validation.constraints.NotNull;
import lombok.Value;

import java.util.UUID;

@Value
// KHÔNG DÙNG @AllArgsConstructor VÌ TA TỰ ĐỊNH NGHĨA HÀM TẠO
public class RedeemRewardRequest {
    
    @NotNull(message = "Reward ID không được để trống") 
    UUID rewardId;

    // SỬA LỖI: Thêm constructor với @JsonCreator để Jackson biết cách ánh xạ
    @JsonCreator
    public RedeemRewardRequest(
        @JsonProperty("rewardId") @NotNull(message = "Reward ID không được để trống") UUID rewardId) {
        this.rewardId = rewardId;
    }
}