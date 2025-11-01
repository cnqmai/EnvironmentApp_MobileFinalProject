package com.enviro.app.environment_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.HttpStatus;

import com.enviro.app.environment_backend.dto.AqiResponse; 
import com.enviro.app.environment_backend.dto.OpenWeatherMapResponse;
import com.enviro.app.environment_backend.dto.AqiDataPoint; 
import com.enviro.app.environment_backend.dto.GeocodingResponse; // Import DTO mới

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class AqiService {

    // Lấy API key và URL cơ sở từ application.yml
    @Value("${aqi.api.key}")
    private String aqiApiKey;
    
    @Value("${aqi.api.base-url}") // URL API AQI
    private String aqiApiBaseUrl;

    @Value("${aqi.api.geocoding-url}") // URL API Geocoding
    private String geocodingApiUrl; 

    private final RestTemplate restTemplate = new RestTemplate();

    private final Map<Integer, String> AQI_STATUS = Map.of(
        1, "Good",
        2, "Fair",
        3, "Moderate",
        4, "Poor",
        5, "Very Poor"
    );

    /**
     * Lấy tên thành phố từ tọa độ bằng OpenWeatherMap Geocoding API (Sử dụng DTO).
     */
    private String getCityName(double latitude, double longitude) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(geocodingApiUrl)
            .queryParam("lat", latitude)
            .queryParam("lon", longitude)
            .queryParam("limit", 1) 
            .queryParam("appid", aqiApiKey); 

        try {
            // Sử dụng DTO GeocodingResponse[] để ánh xạ mảng JSON
            GeocodingResponse[] response = restTemplate.getForObject(builder.toUriString(), GeocodingResponse[].class);
            
            if (response != null && response.length > 0) {
                // Trả về tên địa danh từ phần tử đầu tiên
                return response[0].getName(); 
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi gọi Geocoding API: " + e.getMessage());
        }
        return "Unknown Location";
    }

    /**
     * Lấy dữ liệu AQI từ OpenWeatherMap dựa trên tọa độ GPS.
     */
    public AqiResponse getCurrentAqiByGps(double latitude, double longitude) {
        
        // 1. GỌI GEOCoding API ĐỂ LẤY TÊN THÀNH PHỐ
        String cityName = getCityName(latitude, longitude); 
        
        // 2. Thiết lập URL cho API AQI
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(aqiApiBaseUrl)
            .queryParam("lat", latitude)
            .queryParam("lon", longitude)
            .queryParam("appid", aqiApiKey); 

        String url = builder.toUriString();

        try {
            // 3. Gửi Request và ánh xạ sang DTO OpenWeatherMap
            OpenWeatherMapResponse apiResponse = restTemplate.getForObject(
                url,
                OpenWeatherMapResponse.class
            );
            
            // 4. Trích xuất và ánh xạ sang DTO của ứng dụng
            if (apiResponse == null || apiResponse.getList() == null || apiResponse.getList().isEmpty()) {
                 return AqiResponse.builder().aqiValue(-1).status("Dữ liệu không hợp lệ").latitude(latitude).longitude(longitude).build();
            }
            
            AqiDataPoint dataPoint = apiResponse.getList().get(0);
            int aqiIndex = dataPoint.getMain().getAqi();
            Map<String, Double> components = dataPoint.getComponents();
            
            String dominantPollutant = getDominantPollutant(components);
            String timeObservation = formatTimestamp(dataPoint.getDt());

            // 5. Ánh xạ sang AqiResponse gọn gàng
            return AqiResponse.builder()
                .aqiValue(aqiIndex)
                .status(AQI_STATUS.getOrDefault(aqiIndex, "Unknown"))
                .dominantPollutant(dominantPollutant)
                .latitude(latitude)
                .longitude(longitude)
                .city(cityName) // <-- Đã sửa: Gán tên thành phố đã lấy được
                .healthAdvisory(getHealthAdvisory(aqiIndex))
                .timeObservation(timeObservation)
                .build();

        } catch (HttpClientErrorException e) {
            // Xử lý lỗi 4xx (ví dụ: 401 Unauthorized do API Key sai)
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                 throw new RuntimeException("Lỗi API Key: Khóa API AQI không hợp lệ.");
            }
            throw new RuntimeException("Lỗi HTTP khi gọi API AQI: " + e.getMessage());
        } catch (Exception e) {
            // Lỗi mạng, lỗi JSON, v.v.
            throw new RuntimeException("Lỗi kết nối hoặc xử lý dữ liệu AQI: " + e.getMessage());
        }
    }
    
    // --- Các hàm tiện ích (Utilities) ---

    private String getDominantPollutant(Map<String, Double> components) {
        if (components == null || components.isEmpty()) return "N/A";
        
        if (components.containsKey("pm2_5")) {
             return "PM2.5";
        }
        return "N/A";
    }

    private String getHealthAdvisory(int aqiIndex) {
        switch (aqiIndex) {
            case 1: return "Chất lượng không khí tuyệt vời. Thoải mái hoạt động ngoài trời.";
            case 2: return "Chất lượng không khí chấp nhận được. Có thể hoạt động ngoài trời.";
            case 3: return "Không khí ở mức vừa phải. Người nhạy cảm (trẻ em, người già) nên hạn chế hoạt động ngoài trời.";
            case 4: return "Không khí kém. Mọi người nên hạn chế hoạt động ngoài trời.";
            case 5: return "Không khí rất kém. Tránh hoàn toàn các hoạt động ngoài trời.";
            default: return "Chưa có lời khuyên cụ thể.";
        }
    }

    private String formatTimestamp(long dt) {
        return Instant.ofEpochSecond(dt)
            .atZone(ZoneId.of("Asia/Ho_Chi_Minh")) 
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
    }
}