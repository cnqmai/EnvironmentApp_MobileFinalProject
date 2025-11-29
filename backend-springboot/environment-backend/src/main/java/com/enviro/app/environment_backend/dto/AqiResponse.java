package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class AqiResponse {
    // 1. Dữ liệu tính toán (Thang 0-500)
    private int calculatedAqiValue; // Mới: Giá trị AQI đã tính theo chuẩn Mỹ (0-500)

    // 2. Dữ liệu gốc và cơ bản
    private int owmAqiValue; // Gốc: Giá trị AQI OWM (1-5)
    private String status;
    private String dominantPollutant;
    private double latitude;
    private double longitude;
    private String city;
    private String timeObservation;
    private String healthAdvisory;
    
    // 3. Toàn bộ dữ liệu nồng độ chi tiết
    private Map<String, Double> components; 
}