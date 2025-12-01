package com.enviro.app.environment_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Value;

@Value
public class PrivacySettingsRequest {
    // Tương ứng với switch "Chia sẻ dữ liệu cá nhân"
    @JsonProperty("share_personal_data")
    Boolean sharePersonalData; 

    // Tương ứng với switch "Chia sẻ vị trí"
    @JsonProperty("share_location")
    Boolean shareLocation;
}