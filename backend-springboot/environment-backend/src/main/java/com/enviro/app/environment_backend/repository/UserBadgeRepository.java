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
    
    // Tìm badge theo đối tượng User
    List<UserBadge> findByUserOrderByEarnedAtDesc(User user);
    
    // Kiểm tra tồn tại
    boolean existsByUserAndBadge(User user, Badge badge);

    // [FIX] Thêm phương thức tìm theo userId và sắp xếp (Sửa lỗi BadgeService)
    @Query("SELECT ub FROM UserBadge ub WHERE ub.user.id = :userId ORDER BY ub.earnedAt DESC")
    List<UserBadge> findByUserIdOrderByEarnedAtDesc(@Param("userId") UUID userId);

    // Tìm danh sách UserBadge theo userId
    @Query("SELECT ub FROM UserBadge ub WHERE ub.user.id = :userId")
    List<UserBadge> findByUserId(@Param("userId") UUID userId);

    void deleteByUser(User user);
}