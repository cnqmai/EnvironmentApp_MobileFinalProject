package com.enviro.app.environment_backend.scheduler;

import com.enviro.app.environment_backend.model.NotificationType;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.UserRepository;
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
    
    // MAPPING: Dùng Map để chuyển đổi AQI (1-5) sang mô tả tiếng Việt
    private static final Map<Integer, String> AQI_STATUS_MAP = Map.of(
        1, "TỐT",
        2, "TRUNG BÌNH",
        3, "KHÔNG TỐT CHO NHÓM NHẠY CẢM",
        4, "KÉM", // Poor
        5, "RẤT KÉM" // Very Poor / Hazardous
    );


    public NotificationScheduler(UserRepository userRepository, 
                                 NotificationService notificationService,
                                 RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.restTemplate = restTemplate;
    }

    // ====================================================================
    // FR-6.2: Nhắc nhở lịch thu gom rác (Chạy lúc 7:00 sáng mỗi ngày)
    // ====================================================================
    @Scheduled(cron = "0 0 7 * * ?")
    public void scheduleCollectionReminder() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            notificationService.createNotification(
                user,
                "📅 Nhắc nhở thu gom",
                "Hôm nay là ngày thu gom rác tái chế trong khu vực của bạn. Hãy chuẩn bị rác nhé!",
                NotificationType.COLLECTION_REMINDER,
                null
            );
        }
        System.out.println(">>> [Scheduler] Đã gửi thông báo thu gom rác.");
    }
    
    // ====================================================================
    // FR-6.1: Thông báo chiến dịch môi trường (Chạy 9:00 sáng Thứ Hai hàng tuần)
    // ====================================================================
    @Scheduled(cron = "0 0 9 ? * MON")
    public void scheduleCampaignNotification() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            notificationService.createNotification(
                user,
                "📢 Chiến dịch Mùa Hè Xanh",
                "Tham gia chiến dịch 'Đổi rác lấy quà' tại công viên trung tâm tuần này!",
                NotificationType.CAMPAIGN, 
                null
            );
        }
        System.out.println(">>> [Scheduler] Đã gửi thông báo chiến dịch.");
    }


    // ====================================================================
    // FR-6.3: Cảnh báo AQI (Chạy mỗi 1 tiếng)
    // ====================================================================
    @Scheduled(fixedRate = 3600000) 
    public void scheduleWeatherAlert() {
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            if (user.getDefaultLocation() != null && !user.getDefaultLocation().isEmpty()) {
                try {
                    double lat = 10.762622; // Hardcode tọa độ
                    double lon = 106.660172;

                    String url = String.format("%s?lat=%f&lon=%f&appid=%s", apiUrl, lat, lon, apiKey);
                    String response = restTemplate.getForObject(url, String.class);

                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode root = mapper.readTree(response);
                    int aqi = root.path("list").get(0).path("main").path("aqi").asInt(); // 1-5 Scale

                    String statusText = AQI_STATUS_MAP.getOrDefault(aqi, "KHÔNG RÕ");
                    
                    // 3. Kiểm tra ngưỡng (Chỉ cảnh báo khi KÉM trở lên, tức AQI 4 hoặc 5)
                    if (aqi >= 4) {
                        notificationService.createNotification(
                            user,
                            "⚠️ Cảnh báo chất lượng không khí",
                            String.format("Chất lượng không khí tại khu vực của bạn đang ở mức %s (Thang đo OWM: %d). Nên hạn chế ra ngoài.", statusText, aqi),
                            NotificationType.AQI_ALERT,
                            null
                        );
                        System.out.println(">>> [Scheduler] Đã gửi cảnh báo AQI cho user: " + user.getEmail());
                    }

                } catch (Exception e) {
                    System.err.println("Lỗi check AQI cho user " + user.getEmail() + ": " + e.getMessage());
                }
            }
        }
    }
}