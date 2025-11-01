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
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, UserBadgeId> {
    
    /**
     * Lấy tất cả badges của một user
     */
    List<UserBadge> findByUserOrderByEarnedAtDesc(User user);
    
    /**
     * Kiểm tra xem user đã có badge chưa
     */
    boolean existsByUserAndBadge(User user, Badge badge);
    
    /**
     * Tìm UserBadge theo user và badge
     */
    Optional<UserBadge> findByUserAndBadge(User user, Badge badge);
    
    /**
     * Lấy badges của user theo user_id
     */
    @Query("SELECT ub FROM UserBadge ub WHERE ub.user.id = :userId ORDER BY ub.earnedAt DESC")
    List<UserBadge> findByUserIdOrderByEarnedAtDesc(@Param("userId") UUID userId);
}

