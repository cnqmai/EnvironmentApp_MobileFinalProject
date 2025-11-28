package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.WasteCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WasteCategoryRepository extends JpaRepository<WasteCategory, Long> {
    Optional<WasteCategory> findBySlug(String slug);
}