package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Value;

@Value
public class OAuth2LoginRequest {
    @NotBlank(message = "Token không được để trống")
    String token;
}