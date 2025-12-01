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
    // FR-6.2: Nhắc nhở lịch thu gom rác (Chạy lúc 7:00 sáng và 10:00 tối mỗi ngày)
    // ====================================================================
    @Scheduled(cron = "0 0 7,22 * * ?") 
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
    // FR-6.1: Thông báo chiến dịch môi trường (Chạy 9:00 sáng Thứ 7 và Chủ Nhật)
    // ====================================================================
    @Scheduled(cron = "0 0 9 ? * SAT,SUN") 
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
    // FR-2.2.1: Cảnh báo AQI (Logic tính toán chính xác hơn)
    // ====================================================================
    @Scheduled(fixedRate = 3600000) 
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