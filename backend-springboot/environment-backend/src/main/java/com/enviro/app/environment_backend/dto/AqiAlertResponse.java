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
}