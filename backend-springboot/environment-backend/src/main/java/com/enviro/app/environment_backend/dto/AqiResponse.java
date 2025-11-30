package com.enviro.app.environment_backend.dto;

import java.util.Map; // Cần import Map
import lombok.Builder;
import lombok.Value;
import lombok.AllArgsConstructor; // Cần import AllArgsConstructor

/**
 * DTO trả về dữ liệu AQI (Chỉ số Chất lượng Không khí) cho client.
 */
@Value
@Builder
@AllArgsConstructor // [QUAN TRỌNG] Thêm dòng này để Builder hoạt động ổn định
public class AqiResponse {

    // --- Thông tin chung ---
    int aqiValue; 
    String status; 
    String dominantPollutant; 
    
    // --- Thông tin địa lý ---
    double latitude;
    double longitude;
    String city; 
    
    // --- Thông tin sức khỏe và thời gian ---
    String healthAdvisory; 
    String timeObservation; 

    // [QUAN TRỌNG] Thêm trường này để chứa dữ liệu chi tiết (PM2.5, PM10...)
    // Nếu thiếu, AqiService sẽ báo lỗi khi gọi .components(...)
    Map<String, Double> components;

    // Getter tường minh (giữ nguyên nếu bạn muốn, dù Lombok đã tự tạo)
    public int getAqiValue() {
        return aqiValue;
    }
}