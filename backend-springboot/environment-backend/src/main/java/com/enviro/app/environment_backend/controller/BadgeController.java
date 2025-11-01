package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.BadgeResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.BadgeService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến Badges System (FR-9.1.2)
 */
@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    private final BadgeService badgeService;
    private final UserService userService;

    public BadgeController(BadgeService badgeService, UserService userService) {
        this.badgeService = badgeService;
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
     * API LẤY TẤT CẢ BADGES (FR-9.1.2)
     * GET /api/badges
     * Trả về tất cả badges, đánh dấu badges nào user đã đạt được
     */
    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getAllBadges() {
        User user = getCurrentUser();
        List<BadgeResponse> badges = badgeService.getAllBadges(user);
        return ResponseEntity.ok(badges);
    }

    /**
     * API LẤY BADGES CỦA USER HIỆN TẠI (FR-9.1.2)
     * GET /api/badges/me
     */
    @GetMapping("/me")
    public ResponseEntity<List<BadgeResponse>> getMyBadges() {
        User user = getCurrentUser();
        List<BadgeResponse> badges = badgeService.getUserBadges(user);
        return ResponseEntity.ok(badges);
    }
}

