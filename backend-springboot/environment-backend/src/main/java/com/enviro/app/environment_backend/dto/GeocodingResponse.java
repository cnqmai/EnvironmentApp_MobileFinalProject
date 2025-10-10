package com.enviro.app.environment_backend.dto;

import java.util.Map;

import lombok.Data;

/**
 * DTO ánh xạ một đối tượng vị trí từ mảng phản hồi của OpenWeatherMap Geocoding API.
 * (Ví dụ: Một thành phố/địa danh cụ thể)
 */
@Data
public class GeocodingResponse {

    // Tên địa danh (ví dụ: "Hanoi")
    private String name; 

    // Tên địa phương (ví dụ: tên tiếng Việt, tiếng Anh) - Không cần thiết cho việc lấy tên, nhưng hữu ích để biết cấu trúc
    private Map<String, String> local_names;

    // Vĩ độ (Latitude)
    private double lat; 

    // Kinh độ (Longitude)
    private double lon;

    // Mã quốc gia (Ví dụ: "VN")
    private String country;
}