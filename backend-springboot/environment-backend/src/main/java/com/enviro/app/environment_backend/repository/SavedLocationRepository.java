package com.enviro.app.environment_backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.enviro.app.environment_backend.model.SavedLocation;

public interface SavedLocationRepository extends JpaRepository<SavedLocation, UUID> {
    // Phương thức tìm tất cả các vị trí đã lưu của một User cụ thể
    List<SavedLocation> findByUserId(UUID userId);
    
    // Đếm số vị trí đã lưu của một user
    long countByUserId(UUID userId);
}