package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.NotificationSettings;
import com.enviro.app.environment_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, UUID> {
    
    /**
     * Tìm settings theo user
     */
    Optional<NotificationSettings> findByUser(User user);
    
    /**
     * Tìm settings theo user_id
     */
    @Query("SELECT ns FROM NotificationSettings ns WHERE ns.user.id = :userId")
    Optional<NotificationSettings> findByUserId(@Param("userId") UUID userId);
}

