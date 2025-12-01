package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.CampaignRequest; 
import com.enviro.app.environment_backend.dto.CampaignResponse; 
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.CampaignService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List; 
import java.util.UUID;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService campaignService;
    private final UserService userService;

    public CampaignController(CampaignService campaignService, UserService userService) {
        this.campaignService = campaignService;
        this.userService = userService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }
    
    /**
     * API TẠO SỰ KIỆN/CHIẾN DỊCH MỚI
     * POST /api/campaigns
     */
    @PostMapping
    public ResponseEntity<CampaignResponse> createCampaign(@RequestBody CampaignRequest request) {
        User currentUser = getCurrentUser();
        
        try {
            CampaignResponse newCampaign = campaignService.createCampaign(currentUser.getId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(newCampaign);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi tạo sự kiện.");
        }
    }
    
    /**
     * API LẤY CHI TIẾT SỰ KIỆN THEO ID (FIX LỖI 404)
     * GET /api/campaigns/{eventId}
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<CampaignResponse> getEventDetail(@PathVariable UUID eventId) {
        // Cần xác thực user trước khi lấy chi tiết (Giả định đã được xử lý bởi Security Filter Chain)
        try {
            CampaignResponse detail = campaignService.findEventDetail(eventId);
            return ResponseEntity.ok(detail);
        } catch (ResponseStatusException e) {
             // Ném lỗi 404 nếu không tìm thấy (do Service trả về)
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy chi tiết sự kiện.");
        }
    }


    /**
     * API ĐĂNG KÝ THAM GIA CHIẾN DỊCH VÀ CỘNG ĐIỂM (FR-9.1.1)
     * POST /api/campaigns/{eventId}/register
     */
    @PostMapping("/{eventId}/register")
    public ResponseEntity<Void> registerForCampaign(@PathVariable UUID eventId) {
        User currentUser = getCurrentUser();
        
        try {
            campaignService.registerUserForCampaign(currentUser.getId(), eventId);
            return ResponseEntity.ok().build();
            
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi đăng ký chiến dịch.");
        }
    }

    /**
     * API LẤY TẤT CẢ SỰ KIỆN (Campaigns)
     * GET /api/campaigns/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<CampaignResponse>> findAllCampaigns() {
        List<CampaignResponse> campaigns = campaignService.findAllEvents(); 
        return ResponseEntity.ok(campaigns);
    }
}