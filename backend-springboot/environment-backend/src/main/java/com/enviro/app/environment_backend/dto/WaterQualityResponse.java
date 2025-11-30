package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;
import java.util.Map;

@Value
@Builder
public class WaterQualityResponse {
    // Các chỉ số quan trọng (Ví dụ: pH, TSS, DO)
    Map<String, Double> parameters;
    // Chỉ số chất lượng tổng thể (Ví dụ: WQI hoặc chỉ số mức độ)
    double mainIndexValue; 
    // Trạng thái
    String status;
    // Khuyến cáo
    String healthAdvisory;
    String city;
    double latitude;
    double longitude;
    String timeObservation;
}