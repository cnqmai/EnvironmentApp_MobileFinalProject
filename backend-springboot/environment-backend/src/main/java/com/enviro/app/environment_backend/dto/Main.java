package com.enviro.app.environment_backend.dto;

import lombok.Data;

/**
 * Lớp ánh xạ chỉ số AQI chính (1-5) từ OpenWeatherMap.
 */
@Data
public class Main { 
    // Chỉ số AQI (1=Good, 5=Very Poor)
    private int aqi; 
}