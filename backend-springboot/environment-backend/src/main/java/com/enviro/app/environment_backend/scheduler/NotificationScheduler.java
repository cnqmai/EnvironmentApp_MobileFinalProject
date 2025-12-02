package com.enviro.app.environment_backend.scheduler;

import com.enviro.app.environment_backend.dto.GeocodingResponse;
import com.enviro.app.environment_backend.model.NotificationSettings;
import com.enviro.app.environment_backend.model.NotificationType;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.NotificationSettingsRepository;
import com.enviro.app.environment_backend.repository.UserRepository;
import com.enviro.app.environment_backend.service.AqiService;
import com.enviro.app.environment_backend.service.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate; 

import java.util.List;
import java.util.Map;

@Component
public class NotificationScheduler {
    
    @Value("${aqi.api.key}")
    private String apiKey;

    @Value("${aqi.api.base-url}")
    private String apiUrl;
    
    private final RestTemplate restTemplate;

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final NotificationSettingsRepository notificationSettingsRepository; 
    private final AqiService aqiService;

    // MAPPING OWM AQI (1-5) sang AQI USA (0-500)
    private static final Map<Integer, Integer> OWM_TO_USA_AQI_MAX = Map.of(
        1, 50,    
        2, 100,   
        3, 150,   
        4, 200,   
        5, 300    
    );

    // MAPPING: Dùng Map để chuyển đổi AQI (1-5) sang mô tả tiếng Việt
    private static final Map<Integer, String> AQI_STATUS_MAP = Map.of(
        1, "TỐT",
        2, "TRUNG BÌNH",
        3, "KHÔNG TỐT CHO NHÓM NHẠY CẢM",
        4, "KÉM", 
        5, "RẤT KÉM" 
    );

    public NotificationScheduler(UserRepository userRepository, 
                                 NotificationService notificationService,
                                 RestTemplate restTemplate,
                                 NotificationSettingsRepository notificationSettingsRepository, 
                                 AqiService aqiService) { 
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.restTemplate = restTemplate;
        this.notificationSettingsRepository = notificationSettingsRepository;
        this.aqiService = aqiService;
    }

    // Hàm tiện ích để lấy settings hoặc tạo mới settings mặc định
    private NotificationSettings getOrCreateSettings(User user) {
        return notificationService.getOrCreateSettings(user);
    }
    
    // ====================================================================
    // [TESTING] Scheduled task để test thông báo ngay lập tức
    // Chạy mỗi 5 phút - CÓ THỂ COMMENT LẠI SAU KHI TEST XONG
    // ====================================================================
    // @Scheduled(fixedRate = 300000) // 5 phút = 300000ms
    // public void testNotifications() {
    //     System.out.println(">>> [TEST] Bắt đầu test thông báo...");
    //     List<User> users = userRepository.findAll();
    //     
    //     for (User user : users) {
    //         NotificationSettings settings = getOrCreateSettings(user);
    //         
    //         // Test FR-6.1: Chiến dịch
    //         if (settings.getCampaignNotificationsEnabled()) {
    //             notificationService.createNotification(
    //                 user,
    //                 "📢 [TEST] Chiến dịch Môi trường",
    //                 "Đây là thông báo test cho chiến dịch môi trường địa phương.",
    //                 NotificationType.CAMPAIGN,
    //                 null
    //             );
    //         }
    //         
    //         // Test FR-6.2: Nhắc nhở thu gom
    //         if (settings.getCollectionReminderEnabled()) {
    //             notificationService.createNotification(
    //                 user,
    //                 "📅 [TEST] Nhắc nhở thu gom",
    //                 "Đây là thông báo test cho nhắc nhở lịch thu gom rác tái chế.",
    //                 NotificationType.COLLECTION_REMINDER,
    //                 null
    //             );
    //         }
    //         
    //         // Test FR-6.3: Cảnh báo thời tiết
    //         if (settings.getWeatherAlertEnabled()) {
    //             notificationService.createNotification(
    //                 user,
    //                 "🌦️ [TEST] Cảnh báo thời tiết",
    //                 "Đây là thông báo test cho cảnh báo thời tiết ảnh hưởng đến chất lượng không khí.",
    //                 NotificationType.WEATHER_ALERT,
    //                 null
    //             );
    //         }
    //     }
    //     System.out.println(">>> [TEST] Hoàn tất test thông báo.");
    // }
    
    // ====================================================================
    // FR-6.2: Nhắc nhở lịch thu gom rác
    // [TESTING] Chạy mỗi 5 phút để test - ĐỔI LẠI CRON SAU KHI TEST XONG
    // ====================================================================
    @Scheduled(fixedRate = 300000) // 5 phút = 300000ms
    // @Scheduled(cron = "0 0 8,9,13,14,22 * * ?") // [PRODUCTION] Chạy lúc 8h, 9h, 13h, 14h, 22h mỗi ngày
    public void scheduleCollectionReminder() {
        List<User> users = userRepository.findAll(); 
        
        for (User user : users) {
            NotificationSettings settings = getOrCreateSettings(user); 
            
            if (settings.getCollectionReminderEnabled()) {
                notificationService.createNotification(
                    user,
                    "📅 Nhắc nhở thu gom",
                    "Hôm nay là ngày thu gom rác tái chế trong khu vực của bạn. Hãy chuẩn bị rác nhé!",
                    NotificationType.COLLECTION_REMINDER,
                    null
                );
                System.out.println(">>> [Scheduler] Đã gửi thông báo thu gom rác cho user: " + user.getEmail());
            }
        }
        System.out.println(">>> [Scheduler] Hoàn tất vòng lặp nhắc nhở thu gom rác.");
    }
    
    // ====================================================================
    // FR-6.1: Thông báo chiến dịch môi trường
    // [TESTING] Chạy mỗi 5 phút để test - ĐỔI LẠI CRON SAU KHI TEST XONG
    // ====================================================================
    @Scheduled(fixedRate = 300000) // 5 phút = 300000ms
    // @Scheduled(cron = "0 0 8,9,13,14,22 * * ?") // [PRODUCTION] Chạy lúc 8h, 9h, 13h, 14h, 22h mỗi ngày
    public void scheduleCampaignNotification() {
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            NotificationSettings settings = getOrCreateSettings(user);
            
            if (settings.getCampaignNotificationsEnabled()) {
                
                notificationService.createNotification(
                    user,
                    "📢 Chiến dịch Cuối Tuần Xanh",
                    "Tham gia chiến dịch 'Đổi rác lấy quà' tại công viên trung tâm cuối tuần này!",
                    NotificationType.CAMPAIGN, 
                    null
                );
                System.out.println(">>> [Scheduler] Đã gửi thông báo chiến dịch cho user: " + user.getEmail());
            } 
        }
        System.out.println(">>> [Scheduler] Đã hoàn tất vòng lặp thông báo chiến dịch.");
    }

    // ====================================================================
    // FR-6.3: Cảnh báo thời tiết ảnh hưởng đến chất lượng không khí
    // [TESTING] Chạy mỗi 5 phút để test - ĐỔI LẠI CRON SAU KHI TEST XONG
    // ====================================================================
    @Scheduled(fixedRate = 300000) // 5 phút = 300000ms
    // @Scheduled(cron = "0 0 6,12,18,0 * * ?") // [PRODUCTION] Chạy mỗi 6 giờ (lúc 6h, 12h, 18h, 0h mỗi ngày)
    public void scheduleWeatherAlerts() {
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            NotificationSettings settings = getOrCreateSettings(user);
            
            if (!settings.getWeatherAlertEnabled() || user.getDefaultLocation() == null || user.getDefaultLocation().isEmpty()) {
                continue;
            }

            try {
                String defaultAddress = user.getDefaultLocation();
                GeocodingResponse geoResponse = aqiService.geocodeAddress(defaultAddress);

                if (geoResponse == null) continue; 
                
                double lat = geoResponse.getLat(); 
                double lon = geoResponse.getLon(); 
                
                // Lấy dữ liệu thời tiết từ OpenWeatherMap API
                String weatherUrl = String.format("%s?lat=%f&lon=%f&appid=%s", apiUrl, lat, lon, apiKey);
                String weatherResponse = restTemplate.getForObject(weatherUrl, String.class);

                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(weatherResponse);
                
                // Lấy thông tin thời tiết
                JsonNode weatherData = root.path("list").get(0);
                JsonNode main = weatherData.path("main");
                JsonNode weather = weatherData.path("weather").get(0);
                
                double humidity = main.path("humidity").asDouble();
                double pressure = main.path("pressure").asDouble();
                String weatherMain = weather.path("main").asText();
                String weatherDescription = weather.path("description").asText();
                
                // Kiểm tra điều kiện thời tiết ảnh hưởng đến chất lượng không khí
                boolean shouldAlert = false;
                String alertMessage = "";
                
                // Điều kiện: Độ ẩm cao (>80%) hoặc áp suất thấp (<1000 hPa) hoặc có sương mù/smog
                if (humidity > 80) {
                    shouldAlert = true;
                    alertMessage = String.format("Độ ẩm cao (%d%%) tại %s có thể làm tăng nồng độ bụi mịn trong không khí. Hãy hạn chế ra ngoài nếu bạn thuộc nhóm nhạy cảm.", 
                                                 (int)humidity, defaultAddress);
                } else if (pressure < 1000) {
                    shouldAlert = true;
                    alertMessage = String.format("Áp suất không khí thấp (%.1f hPa) tại %s có thể khiến chất lượng không khí kém hơn. Hãy chú ý sức khỏe.", 
                                                 pressure, defaultAddress);
                } else if (weatherMain.equals("Fog") || weatherMain.equals("Mist") || weatherDescription.contains("haze") || weatherDescription.contains("smog")) {
                    shouldAlert = true;
                    alertMessage = String.format("Có %s tại %s. Điều kiện này có thể ảnh hưởng đến chất lượng không khí. Hãy đeo khẩu trang khi ra ngoài.", 
                                                 weatherDescription, defaultAddress);
                }
                
                if (shouldAlert) {
                    notificationService.createNotification(
                        user,
                        "🌦️ Cảnh báo thời tiết",
                        alertMessage,
                        NotificationType.WEATHER_ALERT,
                        null
                    );
                    System.out.println(">>> [Scheduler] Weather alert sent for " + user.getEmail() + " at " + defaultAddress);
                }

            } catch (Exception e) {
                System.err.println("Error checking weather for " + user.getEmail() + ": " + e.getMessage());
            }
        }
    }

    // ====================================================================
    // FR-2.2.1: Cảnh báo AQI (Logic tính toán chính xác hơn)
    // ====================================================================
    @Scheduled(fixedRate = 300000) 
    public void scheduleAqiAlerts() {
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            NotificationSettings settings = getOrCreateSettings(user);
            
            if (!settings.getAqiAlertEnabled() || user.getDefaultLocation() == null || user.getDefaultLocation().isEmpty()) {
                continue;
            }

            try {
                String defaultAddress = user.getDefaultLocation();
                GeocodingResponse geoResponse = aqiService.geocodeAddress(defaultAddress);

                if (geoResponse == null) continue; 
                
                double lat = geoResponse.getLat(); 
                double lon = geoResponse.getLon(); 
                
                String url = String.format("%s?lat=%f&lon=%f&appid=%s", apiUrl, lat, lon, apiKey);
                String response = restTemplate.getForObject(url, String.class);

                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response);
                
                // --- SỬA ĐỔI: Lấy nồng độ PM2.5 thay vì index aqi ---
                double pm25 = root.path("list").get(0).path("components").path("pm2_5").asDouble();
                
                // Tính toán AQI chuẩn Mỹ (US AQI) từ nồng độ PM2.5
                int realAqi = calculateUSAAQI(pm25);
                
                // Lấy ngưỡng người dùng cài đặt
                int userThreshold = settings.getAqiThreshold();
                
                // So sánh chính xác
                if (realAqi > userThreshold) {
                    String statusText = getAqiStatusText(realAqi);
                    
                    notificationService.createNotification(
                        user,
                        "🚨 CẢNH BÁO AQI: " + realAqi,
                        String.format("Tại %s, chỉ số AQI là %d (%s), vượt ngưỡng an toàn của bạn (%d).", 
                                      defaultAddress, realAqi, statusText, userThreshold),
                        NotificationType.AQI_ALERT,
                        null
                    );
                    System.out.println(">>> [Scheduler] Alert sent: AQI " + realAqi + " > " + userThreshold + " for " + user.getEmail());
                } else {
                    System.out.println(">>> [Scheduler] Safe: AQI " + realAqi + " <= " + userThreshold + " for " + user.getEmail());
                }

            } catch (Exception e) {
                System.err.println("Error checking AQI for " + user.getEmail() + ": " + e.getMessage());
            }
        }
    }

    // Hàm tiện ích: Chuyển đổi trạng thái AQI sang text
    private String getAqiStatusText(int aqi) {
        if (aqi <= 50) return "Tốt";
        if (aqi <= 100) return "Trung bình";
        if (aqi <= 150) return "Kém cho nhóm nhạy cảm";
        if (aqi <= 200) return "Xấu";
        if (aqi <= 300) return "Rất xấu";
        return "Nguy hiểm";
    }

    // Hàm tính toán AQI chuẩn Mỹ từ nồng độ PM2.5 (ug/m3)
    // Công thức Linear Interpolation (EPA Standard)
    private int calculateUSAAQI(double pm25) {
        double c = Math.floor(10 * pm25) / 10;
        if (c <= 12.0) return linear(50, 0, 12.0, 0, c);
        if (c <= 35.4) return linear(100, 51, 35.4, 12.1, c);
        if (c <= 55.4) return linear(150, 101, 55.4, 35.5, c);
        if (c <= 150.4) return linear(200, 151, 150.4, 55.5, c);
        if (c <= 250.4) return linear(300, 201, 250.4, 150.5, c);
        if (c <= 350.4) return linear(400, 301, 350.4, 250.5, c);
        if (c <= 500.4) return linear(500, 401, 500.4, 350.5, c);
        return 500; // Ngoài thang đo
    }

    private int linear(int aqihigh, int aqilow, double conchigh, double conclow, double conc) {
        return (int) Math.round(((conc - conclow) / (conchigh - conclow)) * (aqihigh - aqilow) + aqilow);
    }
}