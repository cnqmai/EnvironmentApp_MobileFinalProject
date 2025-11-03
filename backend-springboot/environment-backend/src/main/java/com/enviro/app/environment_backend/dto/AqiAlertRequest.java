package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class AqiAlertRequest {

    @NotNull(message = "Vĩ độ không được để trống")
    @Min(-90) @Max(90)
    Double latitude;

    @NotNull(message = "Kinh độ không được để trống")
    @Min(-180) @Max(180)
    Double longitude;

    // Ngưỡng AQI do người dùng cài đặt (ví dụ: 3 - Mức Trung bình)
    @NotNull(message = "Ngưỡng AQI không được để trống")
    @Min(1) @Max(5)
    Integer threshold;

    // Explicit getters to avoid reliance on Lombok in IDE
    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Integer getThreshold() {
        return threshold;
    }
}