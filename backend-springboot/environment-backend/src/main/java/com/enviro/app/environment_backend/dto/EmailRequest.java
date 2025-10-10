package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;

/**
 * DTO cho yêu cầu quên mật khẩu (chỉ chứa email).
 */
@Value
public class EmailRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;
}