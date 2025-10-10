package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class LocationRequest {
    @NotBlank(message = "Tên không được để trống")
    String name;

    @NotNull(message = "Vĩ độ không được để trống")
    Double latitude;

    @NotNull(message = "Kinh độ không được để trống")
    Double longitude;
}