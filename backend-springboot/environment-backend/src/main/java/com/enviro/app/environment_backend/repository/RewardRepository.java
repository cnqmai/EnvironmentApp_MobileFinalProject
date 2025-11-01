package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Reward;
import com.enviro.app.environment_backend.model.RewardType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RewardRepository extends JpaRepository<Reward, UUID> {
    
    List<Reward> findByIsActiveTrueOrderByPointsCostAsc();
    
    List<Reward> findByTypeAndIsActiveTrueOrderByPointsCostAsc(RewardType type);
}

