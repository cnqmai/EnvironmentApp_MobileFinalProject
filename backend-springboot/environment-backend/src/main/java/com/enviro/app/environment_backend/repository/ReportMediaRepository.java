package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.ReportMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ReportMediaRepository extends JpaRepository<ReportMedia, UUID> {
    // Không cần phương thức tùy chỉnh cho lúc này
}