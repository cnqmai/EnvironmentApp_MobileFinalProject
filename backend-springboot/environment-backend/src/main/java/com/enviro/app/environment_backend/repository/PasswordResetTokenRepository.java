package com.enviro.app.environment_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.enviro.app.environment_backend.model.PasswordResetToken;
import com.enviro.app.environment_backend.model.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    // Tìm Token dựa trên chuỗi Token
    PasswordResetToken findByToken(String token);
    
    // Tìm Token dựa trên User
    PasswordResetToken findByUser(User user);
}