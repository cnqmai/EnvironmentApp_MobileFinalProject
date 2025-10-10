package com.enviro.app.environment_backend.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Value;

/**
 * DTO đại diện cho một vị trí đã lưu CÙNG VỚI dữ liệu AQI hiện tại của nó.
 */
@Value
@Builder
public class SavedLocationAqiResponse {
    
    // Thông tin vị trí đã lưu
    UUID locationId;
    String locationName;

    // Tọa độ
    double latitude;
    double longitude;
    
    // Dữ liệu AQI được trả về từ AqiService
    int aqiValue; 
    String status; 
    String dominantPollutant; 
    String healthAdvisory;
    String timeObservation;
    String resolvedCityName; // Tên thành phố được Geocoding giải quyết
}