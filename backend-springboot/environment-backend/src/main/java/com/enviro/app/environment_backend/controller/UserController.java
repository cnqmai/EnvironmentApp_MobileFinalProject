package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.DeleteAccountRequest;
import com.enviro.app.environment_backend.dto.PrivacySettingsRequest;
import com.enviro.app.environment_backend.dto.PrivacySettingsResponse;
import com.enviro.app.environment_backend.dto.UpdateProfileRequest;
import com.enviro.app.environment_backend.dto.UploadResponse;
import com.enviro.app.environment_backend.dto.UserStatisticsResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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

    /**
     * API LẤY THÔNG TIN CÁ NHÂN
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(currentUser);
    }

    @PostMapping("/avatar")
    public ResponseEntity<UploadResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        User currentUser = getCurrentUser();
        try {
            // Gọi service để lưu file
            String avatarUrl = userService.uploadAvatar(file, currentUser.getId()); 
            
            // Trả về URL để Frontend cập nhật
            return ResponseEntity.ok(new UploadResponse(avatarUrl));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi upload file: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest request) {
        User currentUser = getCurrentUser();
        User updatedUser = userService.updateUserProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }
    
    @DeleteMapping("/me")
    public ResponseEntity<String> deleteMyAccount(
        // Cần body để gửi mật khẩu xác nhận
        @RequestBody DeleteAccountRequest request
    ) {
        User currentUser = getCurrentUser();
        // Gọi service mới đã được cập nhật logic kiểm tra mật khẩu
        userService.deleteUserAccount(currentUser.getId(), request); 
        return ResponseEntity.ok("Tài khoản đã được xóa thành công.");
    }
    
    @GetMapping("/me/statistics")
    public ResponseEntity<UserStatisticsResponse> getMyStatistics() {
        User currentUser = getCurrentUser();
        UserStatisticsResponse statistics = userService.getUserStatistics(currentUser.getId());
        return ResponseEntity.ok(statistics);
    }

    /**
     * API LẤY CÀI ĐẶT RIÊNG TƯ
     * GET /api/users/me/privacy
     */
    @GetMapping("/me/privacy")
    public ResponseEntity<PrivacySettingsResponse> getMyPrivacySettings() {
        User currentUser = getCurrentUser();
        PrivacySettingsResponse settings = userService.getPrivacySettings(currentUser.getId());
        return ResponseEntity.ok(settings);
    }

    /**
     * API CẬP NHẬT CÀI ĐẶT RIÊNG TƯ
     * PUT /api/users/me/privacy
     */
    @PutMapping("/me/privacy")
    public ResponseEntity<PrivacySettingsResponse> updateMyPrivacySettings(@RequestBody PrivacySettingsRequest request) {
        User currentUser = getCurrentUser();
        PrivacySettingsResponse updatedSettings = userService.updatePrivacySettings(currentUser.getId(), request);
        return ResponseEntity.ok(updatedSettings);
    }
}