package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.CampaignRequest; 
import com.enviro.app.environment_backend.dto.CampaignResponse; 
import com.enviro.app.environment_backend.model.Campaign; 
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.CampaignRepository; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException; 
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.web.server.ResponseStatusException; 
import org.springframework.http.HttpStatus;

@Service
public class CampaignService {
    
    private final CampaignRepository campaignRepository; 
    private final UserService userService;
    private final BadgeService badgeService; 

    public CampaignService(CampaignRepository campaignRepository, UserService userService, BadgeService badgeService) {
        this.campaignRepository = campaignRepository; 
        this.userService = userService;
        this.badgeService = badgeService;
    }

    /**
     * TẠO SỰ KIỆN MỚI
     */
    @Transactional
    public CampaignResponse createCampaign(UUID organizerId, CampaignRequest request) {
        // 1. Lấy người tổ chức
        User organizer = userService.findById(organizerId)
                .orElseThrow(() -> new IllegalArgumentException("Người tổ chức không hợp lệ."));

        // 2. Chuyển đổi ngày tháng
        OffsetDateTime eventDateTime;
        if (request.getEventDate() == null || request.getEventDate().trim().isEmpty()) {
             throw new IllegalArgumentException("Ngày diễn ra sự kiện không được để trống.");
        }
        
        try {
            eventDateTime = OffsetDateTime.parse(request.getEventDate());
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Định dạng ngày tháng sự kiện không hợp lệ (cần ISO 8601). Chi tiết: " + e.getMessage());
        }
        
        // 3. Tạo Entity
        Campaign campaign = new Campaign();
        campaign.setTitle(request.getTitle());
        campaign.setDescription(request.getDescription());
        campaign.setLocation(request.getLocation());
        campaign.setEventDate(eventDateTime);
        campaign.setMaxParticipants(request.getMaxParticipants() != null && request.getMaxParticipants() > 0 ? request.getMaxParticipants() : Integer.MAX_VALUE); 
        campaign.setIconCode(request.getIconCode());
        campaign.setOrganizer(organizer); 
        campaign.setCurrentParticipants(0);
        campaign.setStatus("upcoming");

        // 4. Lưu vào DB
        Campaign savedCampaign = campaignRepository.save(campaign);

        return mapToResponse(savedCampaign);
    }
    
    /**
     * Thực hiện logic đăng ký và cộng 100 điểm thưởng.
     */
    @Transactional
    public void registerUserForCampaign(UUID userId, UUID eventId) {
        User user = userService.findById(userId) 
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại."));
        
        Campaign campaign = campaignRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Chiến dịch không tồn tại."));
        
        if (campaign.getCurrentParticipants() >= campaign.getMaxParticipants()) {
             throw new IllegalArgumentException("Chiến dịch đã đủ số người tham gia.");
        }
        
        // --- LOGIC NGHIỆP VỤ ĐĂNG KÝ (Tăng số lượng tham gia) ---
        campaign.setCurrentParticipants(campaign.getCurrentParticipants() + 1);
        campaignRepository.save(campaign);
        
        // --- CỘNG ĐIỂM THƯỞNG (100 điểm) ---
        final int POINTS_TO_EARN = 100;
        
        User updatedUser = badgeService.addRecyclePoints(user, POINTS_TO_EARN);
        
        userService.save(updatedUser); 
    }

    /**
     * Lấy tất cả sự kiện (campaigns) từ DB.
     */
    public List<CampaignResponse> findAllEvents() {
        List<Campaign> campaigns = campaignRepository.findByStatusOrderByEventDateAsc("upcoming"); 
        
        return campaigns.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Phương thức ánh xạ từ Entity sang DTO
     */
    private CampaignResponse mapToResponse(Campaign campaign) {
        return CampaignResponse.builder()
            .id(campaign.getId())
            .title(campaign.getTitle())
            .description(campaign.getDescription()) 
            .location(campaign.getLocation())
            .communityId(campaign.getOrganizer().getId()) 
            .iconCode(campaign.getIconCode())
            .eventDate(campaign.getEventDate())
            .status(campaign.getStatus())
            .participantInfo(campaign.getCurrentParticipants() + "/" + campaign.getMaxParticipants())
            .build();
    }
    
    /**
     * Thêm hàm tìm chi tiết event (cần cho [eventId].jsx)
     */
    public CampaignResponse findEventDetail(UUID eventId) {
        Campaign campaign = campaignRepository.findById(eventId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found.")); 
        
        return mapToResponse(campaign);
    }
}