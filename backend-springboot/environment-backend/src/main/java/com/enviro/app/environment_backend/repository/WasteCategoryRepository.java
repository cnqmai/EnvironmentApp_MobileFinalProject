package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.WasteCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WasteCategoryRepository extends JpaRepository<WasteCategory, Long> {
    // Không cần phương thức tùy chỉnh ngay lúc này
}