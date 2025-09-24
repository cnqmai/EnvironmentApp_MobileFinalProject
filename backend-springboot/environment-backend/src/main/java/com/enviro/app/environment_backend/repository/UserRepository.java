package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository // Đánh dấu đây là một Spring component dạng Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // JpaRepository<User, UUID> có nghĩa là:
    // - Repository này làm việc với Entity 'User'.
    // - Kiểu dữ liệu của khóa chính (id) của User là 'UUID'.
}