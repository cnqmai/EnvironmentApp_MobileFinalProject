package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;

/**
 * DTO (Data Transfer Object) cho yêu cầu đăng ký người dùng.
 * Sử dụng Lombok @Value để tạo immutable class với constructor.
 */
@Value // @Value tự động tạo private final fields, getter và constructor
public class RegisterRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    // Bạn có thể thêm các ràng buộc độ dài/độ phức tạp của mật khẩu tại đây
    String password;

    String fullName;
}