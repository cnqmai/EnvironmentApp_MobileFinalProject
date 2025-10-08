package com.enviro.app.environment_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Thay thế @Value để cho phép custom constructor
@Builder // Cho phép xây dựng đối tượng bằng Builder pattern
@NoArgsConstructor // Cần thiết cho Builder
@AllArgsConstructor // Cần thiết cho Builder
public class AuthResponse {
    String userId;
    String email;
    String fullName;
    String token; 
    @Builder.Default // Giữ giá trị mặc định khi dùng Builder
    String tokenType = "Bearer"; 
    long expires; 
}