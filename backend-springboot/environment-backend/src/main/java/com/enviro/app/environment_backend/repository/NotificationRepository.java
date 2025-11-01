package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Notification;
import com.enviro.app.environment_backend.model.NotificationStatus;
import com.enviro.app.environment_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    /**
     * Lấy tất cả notifications của một user, sắp xếp theo thời gian mới nhất
     */
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Lấy notifications chưa đọc của một user
     */
    List<Notification> findByUserAndStatusOrderByCreatedAtDesc(User user, NotificationStatus status);
    
    /**
     * Đếm số notifications chưa đọc của một user
     */
    long countByUserAndStatus(User user, NotificationStatus status);
    
    /**
     * Lấy notifications của user theo user_id
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
}

