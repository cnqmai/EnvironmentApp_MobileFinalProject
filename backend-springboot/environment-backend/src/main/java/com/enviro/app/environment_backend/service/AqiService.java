package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.AqiDataPoint;
import com.enviro.app.environment_backend.dto.AqiResponse;
import com.enviro.app.environment_backend.dto.GeocodingResponse;
import com.enviro.app.environment_backend.dto.OpenWeatherMapResponse;
import com.enviro.app.environment_backend.model.NotificationSettings;
import com.enviro.app.environment_backend.model.NotificationType;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.NotificationSettingsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

@Service
public class AqiService {

    @Value("${aqi.api.key}")
    private String apiKey;

    @Value("${aqi.api.base-url}")
    private String baseUrl;

    @Value("${aqi.api.geocoding-url}")
    private String geocodingUrl;

    private final RestTemplate restTemplate;
    private final NotificationService notificationService;
    private final NotificationSettingsRepository settingsRepository;
    private final UserService userService;

    public AqiService(RestTemplate restTemplate,
                      NotificationService notificationService,
                      NotificationSettingsRepository settingsRepository,
                      UserService userService) {
        this.restTemplate = restTemplate;
        this.notificationService = notificationService;
        this.settingsRepository = settingsRepository;
        this.userService = userService;
    }

    /**
     * Lấy chỉ số AQI và tự động gửi cảnh báo nếu vượt ngưỡng
     */
    public AqiResponse getCurrentAqiByGps(double lat, double lon) {
        String url = String.format("%s?lat=%s&lon=%s&appid=%s", baseUrl, lat, lon, apiKey);
        try {
            OpenWeatherMapResponse response = restTemplate.getForObject(url, OpenWeatherMapResponse.class);

            if (response != null && response.getList() != null && !response.getList().isEmpty()) {
                AqiDataPoint dataPoint = response.getList().get(0);
                Map<String, Double> components = dataPoint.getComponents();
                long dt = dataPoint.getDt();

                // 1. Tính AQI chuẩn US EPA (0-500)
                double pm25 = components.getOrDefault("pm2_5", 0.0);
                int standardAqi = calculateUSAQIFromPM25(pm25);

                String city = getCityNameFromGps(lat, lon);

                // 2. Kiểm tra ngưỡng và gửi cảnh báo (YÊU CẦU 1)
                checkAndSendAlert(standardAqi, city);

                return AqiResponse.builder()
                        .aqiValue(standardAqi)
                        .status(mapAqiToStatus(standardAqi))
                        .dominantPollutant(findDominantPollutant(components))
                        .latitude(lat)
                        .longitude(lon)
                        .city(city)
                        .timeObservation(convertUnixTime(dt))
                        .healthAdvisory(getHealthAdvisory(standardAqi))
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Logic gửi thông báo đẩy khi vượt ngưỡng an toàn
     */
    private void checkAndSendAlert(int currentAqi, String city) {
        try {
            User currentUser = userService.getCurrentUser();
            if (currentUser == null) return;

            Optional<NotificationSettings> settingsOpt = settingsRepository.findById(currentUser.getId());

            if (settingsOpt.isPresent()) {
                NotificationSettings settings = settingsOpt.get();
                // (YÊU CẦU 2): Sử dụng ngưỡng do người dùng tùy chỉnh (settings.getAqiThreshold)
                if (Boolean.TRUE.equals(settings.getAqiAlertEnabled()) && currentAqi > settings.getAqiThreshold()) {
                    
                    String title = "⚠️ Cảnh báo chất lượng không khí";
                    String message = String.format("Tại %s, chỉ số AQI là %d (%s). Vượt quá ngưỡng an toàn (%d) của bạn.", 
                                                 city, currentAqi, mapAqiToStatus(currentAqi), settings.getAqiThreshold());
                    
                    // Gọi NotificationService (Sửa lỗi tham số: thêm null cho relatedId)
                    notificationService.createNotification(
                        currentUser, 
                        title, 
                        message, 
                        NotificationType.AQI_ALERT, 
                        null 
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi gửi cảnh báo AQI: " + e.getMessage());
        }
    }

    // --- CÁC HÀM PHỤ TRỢ (HELPER METHODS) ---

    // 1. Tính toán AQI chuẩn US EPA
    private int calculateUSAQIFromPM25(double pm25) {
        if (pm25 < 0) return 0;
        if (pm25 <= 12.0) return calculateLinear(50, 0, 12.0, 0, pm25);
        if (pm25 <= 35.4) return calculateLinear(100, 51, 35.4, 12.1, pm25);
        if (pm25 <= 55.4) return calculateLinear(150, 101, 55.4, 35.5, pm25);
        if (pm25 <= 150.4) return calculateLinear(200, 151, 150.4, 55.5, pm25);
        if (pm25 <= 250.4) return calculateLinear(300, 201, 250.4, 150.5, pm25);
        if (pm25 <= 350.4) return calculateLinear(400, 301, 350.4, 250.5, pm25);
        if (pm25 <= 500.4) return calculateLinear(500, 401, 500.4, 350.5, pm25);
        return 500;
    }

    private int calculateLinear(int aqiHigh, int aqiLow, double concHigh, double concLow, double conc) {
        return (int) Math.round(((aqiHigh - aqiLow) / (concHigh - concLow)) * (conc - concLow) + aqiLow);
    }

    // 2. Tìm tọa độ từ địa chỉ (Sửa lỗi Geocoding 404 bằng Retry Loop)
    public GeocodingResponse getCoordinatesFromAddress(String address) {
        String currentAddress = address;
        // Thử tối đa 5 lần cắt chuỗi để tìm địa chỉ phù hợp
        for (int i = 0; i < 5; i++) {
            GeocodingResponse result = callGeocodingApi(currentAddress);
            if (result != null) {
                return result;
            }
            // Cắt bỏ phần đầu trước dấu phẩy (Ví dụ: "Hẻm 123, Phường X, Quận Y" -> "Phường X, Quận Y")
            if (currentAddress.contains(",")) {
                String[] parts = currentAddress.split(",", 2);
                if (parts.length > 1) {
                    currentAddress = parts[1].trim();
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        return null;
    }

    private GeocodingResponse callGeocodingApi(String address) {
        String directGeoUrl = "http://api.openweathermap.org/geo/1.0/direct";
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(directGeoUrl)
                    .queryParam("q", address)
                    .queryParam("limit", 1)
                    .queryParam("appid", apiKey)
                    .build()
                    .toUri();
            ResponseEntity<GeocodingResponse[]> responseEntity = restTemplate.getForEntity(uri, GeocodingResponse[].class);
            GeocodingResponse[] responses = responseEntity.getBody();
            if (responses != null && responses.length > 0) {
                return responses[0];
            }
        } catch (Exception e) {
            // Bỏ qua lỗi để tiếp tục vòng lặp retry
        }
        return null;
    }

    private String getCityNameFromGps(double lat, double lon) {
        try {
            URI uri = UriComponentsBuilder.fromUriString(geocodingUrl)
                .queryParam("lat", lat).queryParam("lon", lon).queryParam("limit", 1).queryParam("appid", apiKey)
                .build().toUri();
            GeocodingResponse[] responses = restTemplate.getForObject(uri, GeocodingResponse[].class);
            if (responses != null && responses.length > 0) return responses[0].getName();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "Unknown Location";
    }

    // 3. Mapping trạng thái và màu sắc (Khớp với Frontend)
    private String mapAqiToStatus(int aqi) {
        if (aqi <= 50) return "Tốt";
        if (aqi <= 100) return "Trung bình";
        if (aqi <= 150) return "Kém";
        if (aqi <= 200) return "Xấu";
        if (aqi <= 300) return "Rất xấu";
        return "Nguy hiểm";
    }

    private String getHealthAdvisory(int aqi) {
        if (aqi <= 50) return "Không khí trong lành, lý tưởng cho hoạt động ngoài trời.";
        if (aqi <= 100) return "Chấp nhận được. Nhóm nhạy cảm nên hạn chế ra ngoài.";
        if (aqi <= 150) return "Nhóm nhạy cảm có thể bị ảnh hưởng sức khỏe. Người bình thường ít ảnh hưởng.";
        if (aqi <= 200) return "Có hại cho sức khỏe. Mọi người bắt đầu cảm thấy ảnh hưởng.";
        if (aqi <= 300) return "Rất có hại. Cảnh báo sức khỏe khẩn cấp.";
        return "Nguy hiểm! Báo động đỏ. Tránh hoàn toàn ra ngoài.";
    }

    private String findDominantPollutant(Map<String, Double> components) {
        if (components == null) return "N/A";
        if (components.containsKey("pm2_5")) return "PM2.5";
        if (components.containsKey("pm10")) return "PM10";
        return "N/A";
    }

    private String convertUnixTime(long unixSeconds) {
        return Instant.ofEpochSecond(unixSeconds)
            .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}