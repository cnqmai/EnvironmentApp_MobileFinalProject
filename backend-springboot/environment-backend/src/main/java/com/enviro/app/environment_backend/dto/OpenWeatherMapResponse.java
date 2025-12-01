package com.enviro.app.environment_backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class OpenWeatherMapResponse {
    private Map<String, Double> coord;
    private List<AqiDataPoint> list; // Chứa các điểm dữ liệu AQI
}