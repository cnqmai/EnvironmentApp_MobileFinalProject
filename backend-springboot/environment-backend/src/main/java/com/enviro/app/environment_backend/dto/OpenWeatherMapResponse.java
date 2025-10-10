package com.enviro.app.environment_backend.dto;

import java.util.List;

import lombok.Data;

/**
 * DTO cấp cao nhất để ánh xạ phản hồi từ API OpenWeatherMap Air Pollution.
 */
@Data 
public class OpenWeatherMapResponse {
    // Trường 'list' chứa các điểm dữ liệu AQI (thường chỉ có một phần tử)
    private List<AqiDataPoint> list; 
}