// File: src/main/java/com/enviro/app/environment_backend/repository/BadgeRepository.java
package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, UUID> {
    // [MỚI] Tìm huy hiệu theo tên (VD: "Người xanh")
    Optional<Badge> findByName(String name);
}