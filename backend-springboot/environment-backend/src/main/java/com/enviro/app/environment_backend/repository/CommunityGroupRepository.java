package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.CommunityGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommunityGroupRepository extends JpaRepository<CommunityGroup, UUID> {
    
    List<CommunityGroup> findByIsPublicTrueOrderByCreatedAtDesc();
    
    @Query("SELECT g FROM CommunityGroup g WHERE g.areaType = :areaType AND g.areaName = :areaName AND g.isPublic = true ORDER BY g.createdAt DESC")
    List<CommunityGroup> findByAreaTypeAndAreaName(@Param("areaType") String areaType, @Param("areaName") String areaName);
}

