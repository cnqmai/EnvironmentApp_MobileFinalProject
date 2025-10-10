package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

/**
 * DTO trả về dữ liệu AQI (Chỉ số Chất lượng Không khí) cho client.
 */
@Value // Dùng @Value để tạo lớp bất biến (immutable)
@Builder // Dùng Builder Pattern để dễ dàng tạo đối tượng trong Service
public class AqiResponse {

    // --- Thông tin chung ---
    int aqiValue; // Chỉ số AQI chính
    String status; // Ví dụ: "Good", "Moderate", "Unhealthy"
    String dominantPollutant; // Chất gây ô nhiễm chính (Ví dụ: PM2.5, O3)
    
    // --- Thông tin địa lý ---
    double latitude;
    double longitude;
    String city; 
    
    // --- Thông tin sức khỏe và thời gian ---
    String healthAdvisory; // Lời khuyên sức khỏe dựa trên AQI
    String timeObservation; // Thời gian quan sát dữ liệu (Ví dụ: "2025-10-10T14:00:00Z")

    // --- Dữ liệu chi tiết về các chất ô nhiễm (tùy chọn) ---
    // double pm25;
    // double o3;
}