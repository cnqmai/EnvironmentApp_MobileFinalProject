package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OAuth2LoginRequest {
    @NotBlank(message = "Token không được để trống")
    private String token; // ID Token từ Google OAuth
}