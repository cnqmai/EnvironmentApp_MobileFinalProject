package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.ReportStatus;
import com.enviro.app.environment_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository để quản lý Entity Report.
 * Phải kế thừa JpaRepository với Entity (Report) và kiểu ID (Long).
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    // JpaRepository<Report, Long> tự động cung cấp các phương thức:
    // save(Report), findById(Long), findAll(), delete(Report), v.v.
    
    /**
     * Tìm tất cả báo cáo của một user, sắp xếp theo thời gian tạo mới nhất
     */
    List<Report> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Tìm tất cả báo cáo của một user theo user_id
     */
    @Query("SELECT r FROM Report r WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Report> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
    
    /**
     * Đếm số lượng báo cáo của một user
     */
    long countByUser(User user);
    
    /**
     * Đếm số lượng báo cáo của một user theo trạng thái
     */
    long countByUserAndStatus(User user, ReportStatus status);

    void deleteByUser(User user);
}