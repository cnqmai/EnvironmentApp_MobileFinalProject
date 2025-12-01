package com.enviro.app.environment_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String avatarUrl;
    private String defaultLocation;
    private String gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
}