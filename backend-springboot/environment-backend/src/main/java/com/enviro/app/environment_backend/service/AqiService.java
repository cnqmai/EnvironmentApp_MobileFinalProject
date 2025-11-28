package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.AqiResponse;
import com.enviro.app.environment_backend.dto.OpenWeatherMapResponse;
import com.enviro.app.environment_backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AqiService {

    @Value("${weather.api-key}")
    private String apiKey;

    private final String API_URL = "http://api.openweathermap.org/data/2.5/air_pollution";
    private final RestTemplate restTemplate = new RestTemplate();
    private final NotificationService notificationService;

    public AqiService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public AqiResponse getAqiByCoordinates(double lat, double lon, User user) {
        String url = String.format("%s?lat=%f&lon=%f&appid=%s", API_URL, lat, lon, apiKey);
        
        try {
            OpenWeatherMapResponse response = restTemplate.getForObject(url, OpenWeatherMapResponse.class);
            if (response != null && !response.getList().isEmpty()) {
                // Lấy nồng độ bụi PM2.5 (µg/m³)
                double pm25 = response.getList().get(0).getComponents().get("pm2_5");
                
                // [MỚI] Tính AQI theo chuẩn US EPA (0-500) thay vì thang 1-5
                int aqi = calculateUS_AQI(pm25);
                
                // Xác định mức độ & Lời khuyên
                String status = getAqiStatus(aqi);
                String advisory = getHealthAdvisory(aqi);

                // [MỚI] Kiểm tra ngưỡng cảnh báo của User
                checkAndSendAlert(user, aqi);

                return new AqiResponse(aqi, status, advisory);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new AqiResponse(0, "Không xác định", "Không lấy được dữ liệu");
    }

    // Logic kiểm tra và gửi thông báo
    private void checkAndSendAlert(User user, int currentAqi) {
        if (user != null && user.getNotificationSettings() != null) {
            Integer threshold = user.getNotificationSettings().getAqiThreshold();
            Boolean isEnabled = user.getNotificationSettings().getAlertEnabled();

            // Nếu bật thông báo và AQI vượt ngưỡng -> Gửi thông báo
            if (Boolean.TRUE.equals(isEnabled) && currentAqi >= threshold) {
                String title = "⚠️ Cảnh báo chất lượng không khí!";
                String message = String.format("AQI hiện tại là %d (%s). Hãy đeo khẩu trang khi ra ngoài.", 
                                             currentAqi, getAqiStatus(currentAqi));
                
                // Gọi NotificationService để lưu thông báo (Frontend sẽ poll về)
                notificationService.createNotification(user, title, message, "AQI_ALERT");
            }
        }
    }

    // Công thức tính AQI chuẩn từ PM2.5
    private int calculateUS_AQI(double pm25) {
        if (pm25 <= 12.0) return linear(50, 0, 12.0, 0, pm25);
        if (pm25 <= 35.4) return linear(100, 51, 35.4, 12.1, pm25);
        if (pm25 <= 55.4) return linear(150, 101, 55.4, 35.5, pm25);
        if (pm25 <= 150.4) return linear(200, 151, 150.4, 55.5, pm25);
        if (pm25 <= 250.4) return linear(300, 201, 250.4, 150.5, pm25);
        if (pm25 <= 350.4) return linear(400, 301, 350.4, 250.5, pm25);
        return linear(500, 401, 500.4, 350.5, pm25);
    }

    private int linear(int I_high, int I_low, double C_high, double C_low, double C) {
        return (int) Math.round(((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low);
    }

    private String getAqiStatus(int aqi) {
        if (aqi <= 50) return "Tốt";
        if (aqi <= 100) return "Trung bình";
        if (aqi <= 150) return "Kém (Nhạy cảm)";
        if (aqi <= 200) return "Xấu";
        if (aqi <= 300) return "Rất xấu";
        return "Nguy hại";
    }

    private String getHealthAdvisory(int aqi) {
        if (aqi <= 50) return "Không khí trong lành, hãy tận hưởng!";
        if (aqi <= 100) return "Nhóm nhạy cảm nên hạn chế vận động mạnh.";
        if (aqi <= 150) return "Người già và trẻ em nên hạn chế ra ngoài.";
        if (aqi <= 200) return "Nên đeo khẩu trang, hạn chế ra đường.";
        if (aqi <= 300) return "Cảnh báo sức khỏe khẩn cấp!";
        return "Mọi người nên ở trong nhà.";
    }
}