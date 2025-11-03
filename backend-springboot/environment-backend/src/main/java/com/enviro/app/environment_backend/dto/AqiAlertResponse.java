package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AqiAlertResponse {
    // True nếu AQI hiện tại vượt ngưỡng
    boolean alert;
    
    // Chỉ số AQI hiện tại tại khu vực
    int currentAqi;
    
    // Ngưỡng mà người dùng đã đặt
    int userThreshold;
    
    // Thông điệp cảnh báo
    String message;

    // Explicit public constructor to avoid reliance on Lombok builder in IDE
    public AqiAlertResponse(boolean alert, int currentAqi, int userThreshold, String message) {
        this.alert = alert;
        this.currentAqi = currentAqi;
        this.userThreshold = userThreshold;
        this.message = message;
    }
}