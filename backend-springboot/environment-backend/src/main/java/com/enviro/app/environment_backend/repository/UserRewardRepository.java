package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRewardRepository extends JpaRepository<UserReward, UUID> {
    
    List<UserReward> findByUserOrderByRedeemedAtDesc(User user);
    
    List<UserReward> findByUserAndStatusOrderByRedeemedAtDesc(User user, String status);
}

