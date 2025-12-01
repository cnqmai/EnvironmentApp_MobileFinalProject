// File: src/main/java/com/enviro/app/environment_backend/repository/UserBadgeRepository.java
package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Badge;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserBadge;
import com.enviro.app.environment_backend.model.UserBadgeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, UserBadgeId> {
    
    // Tìm badge theo đối tượng User (có sẵn)
    List<UserBadge> findByUserOrderByEarnedAtDesc(User user);
    
    // Kiểm tra tồn tại (có sẵn)
    boolean existsByUserAndBadge(User user, Badge badge);

    // [MỚI] Tìm danh sách UserBadge theo userId (Hỗ trợ BadgeService)
    @Query("SELECT ub FROM UserBadge ub WHERE ub.user.id = :userId")
    List<UserBadge> findByUserId(@Param("userId") UUID userId);

    // [MỚI] Kiểm tra tồn tại theo ID (Hỗ trợ BadgeService logic check trùng)
    @Query("SELECT CASE WHEN COUNT(ub) > 0 THEN true ELSE false END FROM UserBadge ub WHERE ub.user.id = :userId AND ub.badge.id = :badgeId")
    boolean existsByUserIdAndBadgeId(@Param("userId") UUID userId, @Param("badgeId") UUID badgeId);

    void deleteByUser(User user);
}