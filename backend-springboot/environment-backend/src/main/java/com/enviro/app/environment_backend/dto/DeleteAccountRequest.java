package com.enviro.app.environment_backend.dto; // Dòng 1

import jakarta.validation.constraints.NotBlank;
import lombok.Value;

/**
 * DTO yêu cầu xóa tài khoản (cần mật khẩu và chuỗi xác nhận)
 */
@Value // Dòng 10
public class DeleteAccountRequest { // Dòng 11
    
    @NotBlank(message = "Mật khẩu không được để trống")
    String password;

    @NotBlank(message = "Cần nhập chính xác chuỗi xác nhận")
    String confirmationText; 
}