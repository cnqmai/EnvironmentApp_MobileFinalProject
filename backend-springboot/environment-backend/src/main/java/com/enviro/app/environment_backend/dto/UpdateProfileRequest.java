package com.enviro.app.environment_backend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String avatarUrl;
    private String defaultLocation;
    
    // --- THÊM MỚI ---
    private String gender;
    private String dateOfBirth; // Nhận dưới dạng String "yyyy-MM-dd"
    private String phoneNumber;
    // ----------------
}