package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Integer> {
    
    /**
     * Tìm badge theo tên
     */
    Optional<Badge> findByName(String name);
    
    /**
     * Lấy tất cả badges, sắp xếp theo điểm yêu cầu tăng dần
     */
    List<Badge> findAllByOrderByRequiredPointsAsc();
    
    /**
     * Tìm badges có điểm yêu cầu <= số điểm cho trước
     */
    List<Badge> findByRequiredPointsLessThanEqualOrderByRequiredPointsAsc(Integer points);
}

