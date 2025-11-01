package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Value;

@Value
public class CreateGroupRequest {
    @NotBlank(message = "Tên nhóm không được để trống")
    String name;
    
    String description;
    String areaType; // 'ward', 'district', 'city'
    String areaName;
    
    Boolean isPublic;
}

