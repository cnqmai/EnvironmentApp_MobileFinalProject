package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.BadgeResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.BadgeService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    // 1. Lấy danh sách tất cả huy hiệu có trong hệ thống
    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    // 2. Lấy danh sách huy hiệu của user đang đăng nhập
    @GetMapping("/me")
    public ResponseEntity<List<BadgeResponse>> getMyBadges() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(badgeService.getUserBadges(currentUser.getId()));
    }
}