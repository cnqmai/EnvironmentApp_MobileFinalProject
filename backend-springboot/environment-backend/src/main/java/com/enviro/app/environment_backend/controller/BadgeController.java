package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.BadgeResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.BadgeService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    private final BadgeService badgeService;
    private final UserService userService;

    public BadgeController(BadgeService badgeService, UserService userService) {
        this.badgeService = badgeService;
        this.userService = userService;
    }

    // Helper: Lấy user hiện tại
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    /**
     * Lấy tất cả huy hiệu hệ thống (FR-9.1.2)
     * Kèm theo trạng thái (isEarned) cho user hiện tại
     * GET /api/badges
     */
    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getAllBadges() {
        User user = getCurrentUser();
        return ResponseEntity.ok(badgeService.getAllBadges(user));
    }

    /**
     * Chỉ lấy những huy hiệu user đã đạt được (FR-9.1.2)
     * GET /api/badges/me
     */
    @GetMapping("/me")
    public ResponseEntity<List<BadgeResponse>> getMyBadges() {
        User user = getCurrentUser();
        return ResponseEntity.ok(badgeService.getUserBadges(user));
    }
}