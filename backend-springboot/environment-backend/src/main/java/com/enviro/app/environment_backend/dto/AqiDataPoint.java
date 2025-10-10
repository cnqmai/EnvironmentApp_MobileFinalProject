package com.enviro.app.environment_backend.dto;

import java.util.Map;

import lombok.Data;

/**
 * DTO đại diện cho một điểm dữ liệu AQI cụ thể trong mảng 'list'.
 */
@Data
public class AqiDataPoint {
    
    // Dữ liệu lồng chứa chỉ số AQI
    private Main main; 
    
    // Dữ liệu lồng chứa nồng độ các chất ô nhiễm (PM2.5, O3, NO2,...)
    private Map<String, Double> components; 
    
    // Thời gian quan sát (timestamp)
    private long dt;
}