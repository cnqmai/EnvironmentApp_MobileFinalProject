package com.enviro.app.environment_backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Cần import Optional

import com.enviro.app.environment_backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // Phương thức custom: Spring Data JPA sẽ tự động triển khai dựa trên tên phương thức
    Optional<User> findByEmail(String email); 
}