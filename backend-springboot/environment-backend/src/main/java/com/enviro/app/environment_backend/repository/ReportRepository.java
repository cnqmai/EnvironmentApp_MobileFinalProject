package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Report; // Cần thiết
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Nên thêm @Repository

/**
 * Repository để quản lý Entity Report.
 * Phải kế thừa JpaRepository với Entity (Report) và kiểu ID (Long).
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    // JpaRepository<Report, Long> tự động cung cấp các phương thức:
    // save(Report), findById(Long), findAll(), delete(Report), v.v.
}