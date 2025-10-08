// Đặt tại: backend-springboot/environment-backend/src/main/java/com/enviro/app/environment_backend/dto/LoginRequest.java
package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;

@Value
public class LoginRequest {
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    String password;
}