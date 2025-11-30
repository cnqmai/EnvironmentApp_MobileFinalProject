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
            
            // KIỂM TRA CỜ BẬT/TẮT: Collection Reminder (Luôn mặc định là TRUE)
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
            
            // KIỂM TRA CỜ BẬT/TẮT: Campaign Notification (Luôn mặc định là TRUE)
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
    // FR-2.2.1 & FR-2.2.2: Cảnh báo AQI (Chạy mỗi 1 tiếng)
    // ====================================================================
    @Scheduled(fixedRate = 3600000) 
    public void scheduleAqiAlerts() {
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            NotificationSettings settings = getOrCreateSettings(user);
            
            // BỎ QUA nếu người dùng tắt cảnh báo AQI HOẶC không có vị trí mặc định
            if (!settings.getAqiAlertEnabled() || user.getDefaultLocation() == null || user.getDefaultLocation().isEmpty()) {
                continue;
            }

            try {
                // 2. TÌM VỊ TRÍ TỪ ĐỊA CHỈ MẶC ĐỊNH CỦA USER
                String defaultAddress = user.getDefaultLocation();
                
                GeocodingResponse geoResponse = aqiService.geocodeAddress(defaultAddress);

                if (geoResponse == null) {
                    System.err.println("Không thể geocode địa chỉ mặc định: " + defaultAddress + " cho user: " + user.getEmail());
                    continue; 
                }
                
                double lat = geoResponse.getLat(); 
                double lon = geoResponse.getLon(); 
                
                // 3. Gọi API OWM thô
                String url = String.format("%s?lat=%f&lon=%f&appid=%s", apiUrl, lat, lon, apiKey);
                String response = restTemplate.getForObject(url, String.class);

                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response);
                int owmAqi = root.path("list").get(0).path("main").path("aqi").asInt(); // Thang 1-5

                // Quy đổi AQI OWM (thang 1-5) sang AQI USA TỐI ĐA (0-500) để so sánh
                int maxUsaAqiForCategory = OWM_TO_USA_AQI_MAX.getOrDefault(owmAqi, 500);
                
                // 4. KIỂM TRA NGƯỠNG CÁ NHÂN (FR-2.2.2)
                int userThreshold = settings.getAqiThreshold();
                
                // Kiểm tra: Nếu AQI OWM (max range) vượt quá ngưỡng tùy chỉnh của người dùng
                if (maxUsaAqiForCategory > userThreshold) {
                    
                    String statusText = AQI_STATUS_MAP.getOrDefault(owmAqi, "KHÔNG RÕ");
                    
                    notificationService.createNotification(
                        user,
                        "🚨 CẢNH BÁO AQI VƯỢT NGƯỠNG!",
                        String.format("Chất lượng không khí tại %s đang ở mức %s (%d). Đã vượt ngưỡng cảnh báo của bạn (%d).", defaultAddress, statusText, maxUsaAqiForCategory, userThreshold),
                        NotificationType.AQI_ALERT,
                        null
                    );
                    System.out.println(">>> [Scheduler] Đã gửi cảnh báo AQI cho user: " + user.getEmail() + " tại " + defaultAddress);
                }

            } catch (Exception e) {
                System.err.println("Lỗi check AQI cho user " + user.getEmail() + ": " + e.getMessage());
            }
        }
    }
}