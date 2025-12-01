package com.enviro.app.environment_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Value;
import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class PrivacySettingsResponse {
    UUID userId;
    
    @JsonProperty("share_personal_data")
    boolean sharePersonalData;
    
    @JsonProperty("share_location")
    boolean shareLocation;
    
    OffsetDateTime updatedAt;
}