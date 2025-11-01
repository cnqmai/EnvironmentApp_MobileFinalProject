package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.DailyTip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyTipRepository extends JpaRepository<DailyTip, UUID> {
    
    List<DailyTip> findByIsActiveTrueOrderByCreatedAtDesc();
    
    Optional<DailyTip> findByDisplayDateAndIsActiveTrue(LocalDate date);
    
    List<DailyTip> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(String category);
}

