package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Value;

/**
 * DTO cho yêu cầu đặt lại mật khẩu (chứa token và mật khẩu mới).
 */
@Value
public class ResetPasswordRequest {

    @NotBlank(message = "Token không được để trống")
    String token;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    // Bạn có thể thêm các ràng buộc độ dài/độ phức tạp tại đây
    String newPassword;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    String confirmPassword;
}