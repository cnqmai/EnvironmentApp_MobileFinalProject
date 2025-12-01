package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    
    // Tìm các chiến dịch sắp diễn ra, sắp xếp theo ngày
    List<Campaign> findByStatusOrderByEventDateAsc(String status);
    
    // Tìm các chiến dịch theo ID cộng đồng hoặc ID người tổ chức (tùy thuộc vào thiết kế)
    // Ví dụ: List<Campaign> findByOrganizerId(UUID organizerId);
}