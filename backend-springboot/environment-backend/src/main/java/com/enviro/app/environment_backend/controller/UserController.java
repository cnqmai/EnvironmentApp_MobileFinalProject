package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.UpdateProfileRequest;
import com.enviro.app.environment_backend.dto.UserStatisticsResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest request) {
        User currentUser = getCurrentUser();
        User updatedUser = userService.updateUserProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }
    
    /**
     * API XÓA TÀI KHOẢN (FR-7.2)
     * DELETE /api/users/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<String> deleteMyAccount() {
        User currentUser = getCurrentUser();
        userService.deleteUser(currentUser.getId());
        return ResponseEntity.ok("Tài khoản đã được xóa thành công.");
    }
    
    /**
     * API LẤY THỐNG KÊ CÁ NHÂN (FR-13.1.1)
     * GET /api/users/me/statistics
     */
    @GetMapping("/me/statistics")
    public ResponseEntity<UserStatisticsResponse> getMyStatistics() {
        User currentUser = getCurrentUser();
        UserStatisticsResponse statistics = userService.getUserStatistics(currentUser.getId());
        return ResponseEntity.ok(statistics);
    }
}