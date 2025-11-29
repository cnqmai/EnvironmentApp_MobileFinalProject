package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class NoiseResponse {
    // Giá trị decibel hiện tại
    int decibel; 
    // Trạng thái (Ví dụ: "Bình thường", "Ô nhiễm")
    String status; 
    // Khuyến cáo sức khỏe
    String healthAdvisory; 
    String city;
    double latitude;
    double longitude;
    String timeObservation;
}