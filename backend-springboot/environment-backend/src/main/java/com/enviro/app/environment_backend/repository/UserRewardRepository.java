// File: src/main/java/com/enviro/app/environment_backend/repository/UserRewardRepository.java
package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.UserReward;
import com.enviro.app.environment_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRewardRepository extends JpaRepository<UserReward, Long> {
    
    // [MỚI] Lấy lịch sử đổi quà của user theo ID, giảm dần theo thời gian
    @Query("SELECT ur FROM UserReward ur WHERE ur.user.id = :userId ORDER BY ur.redeemedAt DESC")
    List<UserReward> findByUserIdOrderByRedeemedAtDesc(@Param("userId") UUID userId);
    
    void deleteByUser(User user);
}