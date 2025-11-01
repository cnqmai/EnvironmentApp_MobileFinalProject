package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.NotificationResponse;
import com.enviro.app.environment_backend.dto.NotificationSettingsRequest;
import com.enviro.app.environment_backend.dto.NotificationSettingsResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.NotificationService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller xử lý các API liên quan đến Notifications (FR-6.x, FR-2.2.2)
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    /**
     * Phương thức tiện ích để lấy User đang đăng nhập từ JWT Token
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    /**
     * API LẤY TẤT CẢ NOTIFICATIONS (FR-6.1, FR-6.2, FR-6.3)
     * GET /api/notifications
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAllNotifications() {
        User user = getCurrentUser();
        List<NotificationResponse> notifications = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(notifications);
    }

    /**
     * API LẤY NOTIFICATIONS CHƯA ĐỌC
     * GET /api/notifications/unread
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {
        User user = getCurrentUser();
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(user);
        return ResponseEntity.ok(notifications);
    }

    /**
     * API ĐẾM SỐ NOTIFICATIONS CHƯA ĐỌC
     * GET /api/notifications/unread/count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = getCurrentUser();
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * API ĐÁNH DẤU NOTIFICATION ĐÃ ĐỌC
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable UUID id) {
        User user = getCurrentUser();
        NotificationResponse notification = notificationService.markAsRead(id, user);
        return ResponseEntity.ok(notification);
    }

    /**
     * API ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        User user = getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu tất cả thông báo là đã đọc"));
    }

    /**
     * API LẤY NOTIFICATION SETTINGS (FR-2.2.2)
     * GET /api/notifications/settings
     */
    @GetMapping("/settings")
    public ResponseEntity<NotificationSettingsResponse> getSettings() {
        User user = getCurrentUser();
        NotificationSettingsResponse settings = notificationService.getSettings(user);
        return ResponseEntity.ok(settings);
    }

    /**
     * API CẬP NHẬT NOTIFICATION SETTINGS (FR-2.2.2)
     * PUT /api/notifications/settings
     */
    @PutMapping("/settings")
    public ResponseEntity<NotificationSettingsResponse> updateSettings(
            @RequestBody NotificationSettingsRequest request) {
        User user = getCurrentUser();
        NotificationSettingsResponse settings = notificationService.updateSettings(user, request);
        return ResponseEntity.ok(settings);
    }
}

