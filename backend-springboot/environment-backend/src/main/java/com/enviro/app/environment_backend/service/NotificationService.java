package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.NotificationResponse;
import com.enviro.app.environment_backend.dto.NotificationSettingsRequest;
import com.enviro.app.environment_backend.dto.NotificationSettingsResponse;
import com.enviro.app.environment_backend.model.Notification;
import com.enviro.app.environment_backend.model.NotificationSettings;
import com.enviro.app.environment_backend.model.NotificationStatus;
import com.enviro.app.environment_backend.model.NotificationType;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.NotificationRepository;
import com.enviro.app.environment_backend.repository.NotificationSettingsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service xử lý logic cho Notifications System (FR-6.x, FR-2.2.2)
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationSettingsRepository settingsRepository;
    // BỔ SUNG: Dịch vụ quản lý Badge (để cập nhật số lượng badge)
    private final BadgeService badgeService; 

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationSettingsRepository settingsRepository,
                               BadgeService badgeService) { // THÊM BADGE SERVICE VÀO CONSTRUCTOR
        this.notificationRepository = notificationRepository;
        this.settingsRepository = settingsRepository;
        this.badgeService = badgeService;
    }

    /**
     * Lấy tất cả notifications của user (Giữ nguyên)
     */
    public List<NotificationResponse> getUserNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notifications.stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy notifications chưa đọc của user (Giữ nguyên)
     */
    public List<NotificationResponse> getUnreadNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserAndStatusOrderByCreatedAtDesc(
                user, NotificationStatus.UNREAD);
        return notifications.stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số notifications chưa đọc (Giữ nguyên)
     */
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndStatus(user, NotificationStatus.UNREAD);
    }

    /**
     * Đánh dấu 1 notification là đã đọc (FIX BADGE UPDATE)
     */
    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy thông báo với ID: " + notificationId
                ));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Bạn không có quyền truy cập thông báo này"
            );
        }

        notification.setStatus(NotificationStatus.READ);
        Notification saved = notificationRepository.save(notification);
        
        // --- QUAN TRỌNG: CẬP NHẬT BADGE COUNT TỔNG ---
        // Giảm số lượng chưa đọc đi 1 đơn vị
        badgeService.decrementNotificationCount(user, 1); 
        
        return mapToNotificationResponse(saved);
    }

    /**
     * Đánh dấu tất cả notifications của user là đã đọc (FIX BADGE UPDATE)
     */
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByUserAndStatusOrderByCreatedAtDesc(
                user, NotificationStatus.UNREAD);
        
        long countToDecrement = unreadNotifications.size(); // Số lượng sẽ giảm

        unreadNotifications.forEach(n -> n.setStatus(NotificationStatus.READ));
        notificationRepository.saveAll(unreadNotifications);

        // --- QUAN TRỌNG: CẬP NHẬT BADGE COUNT TỔNG ---
        if (countToDecrement > 0) {
            // Giảm tổng số badge đi số lượng thông báo vừa đọc
            badgeService.decrementNotificationCount(user, (int) countToDecrement); 
        }
    }

    /**
     * Tạo notification mới (dùng cho internal services) (Giữ nguyên)
     */
    @Transactional
    public Notification createNotification(User user, String title, String message, 
                                         NotificationType type, String relatedId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .status(NotificationStatus.UNREAD)
                .relatedId(relatedId)
                .build();

        // Thêm logic cập nhật badge khi có thông báo mới (tăng thêm 1)
        badgeService.incrementNotificationCount(user, 1);
        
        return notificationRepository.save(notification);
    }

    /**
     * Lấy hoặc tạo notification settings cho user (Giữ nguyên)
     */
    public NotificationSettings getOrCreateSettings(User user) {
        return settingsRepository.findByUser(user)
                .orElseGet(() -> {
                    NotificationSettings defaultSettings = NotificationSettings.builder()
                            .user(user)
                            .aqiAlertEnabled(true)
                            .aqiThreshold(100)
                            .collectionReminderEnabled(true)
                            .campaignNotificationsEnabled(true)
                            .weatherAlertEnabled(true)
                            .badgeNotificationsEnabled(true)
                            .reportStatusNotificationsEnabled(true)
                            .build();
                    return settingsRepository.save(defaultSettings);
                });
    }

    /**
     * Cập nhật notification settings (FR-2.2.2) (Giữ nguyên)
     */
    @Transactional
    public NotificationSettingsResponse updateSettings(User user, NotificationSettingsRequest request) {
        NotificationSettings settings = getOrCreateSettings(user);

        // Cập nhật các trường nếu có trong request
        if (request.getAqiAlertEnabled() != null) {
            settings.setAqiAlertEnabled(request.getAqiAlertEnabled());
        }
        if (request.getAqiThreshold() != null) {
            settings.setAqiThreshold(request.getAqiThreshold());
        }
        if (request.getCollectionReminderEnabled() != null) {
            settings.setCollectionReminderEnabled(request.getCollectionReminderEnabled());
        }
        if (request.getCampaignNotificationsEnabled() != null) {
            settings.setCampaignNotificationsEnabled(request.getCampaignNotificationsEnabled());
        }
        if (request.getWeatherAlertEnabled() != null) {
            settings.setWeatherAlertEnabled(request.getWeatherAlertEnabled());
        }
        if (request.getBadgeNotificationsEnabled() != null) {
            settings.setBadgeNotificationsEnabled(request.getBadgeNotificationsEnabled());
        }
        if (request.getReportStatusNotificationsEnabled() != null) {
            settings.setReportStatusNotificationsEnabled(request.getReportStatusNotificationsEnabled());
        }

        NotificationSettings saved = settingsRepository.save(settings);
        return mapToSettingsResponse(saved);
    }

    /**
     * Lấy notification settings của user (Giữ nguyên)
     */
    public NotificationSettingsResponse getSettings(User user) {
        NotificationSettings settings = getOrCreateSettings(user);
        return mapToSettingsResponse(settings);
    }

    /**
     * Map Notification entity sang NotificationResponse DTO (Giữ nguyên)
     */
    private NotificationResponse mapToNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .status(notification.getStatus())
                .relatedId(notification.getRelatedId())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    /**
     * Map NotificationSettings entity sang NotificationSettingsResponse DTO (Giữ nguyên)
     */
    private NotificationSettingsResponse mapToSettingsResponse(NotificationSettings settings) {
        return NotificationSettingsResponse.builder()
                .aqiAlertEnabled(settings.getAqiAlertEnabled())
                .aqiThreshold(settings.getAqiThreshold())
                .collectionReminderEnabled(settings.getCollectionReminderEnabled())
                .campaignNotificationsEnabled(settings.getCampaignNotificationsEnabled())
                .weatherAlertEnabled(settings.getWeatherAlertEnabled())
                .badgeNotificationsEnabled(settings.getBadgeNotificationsEnabled())
                .reportStatusNotificationsEnabled(settings.getReportStatusNotificationsEnabled())
                .createdAt(settings.getCreatedAt())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}