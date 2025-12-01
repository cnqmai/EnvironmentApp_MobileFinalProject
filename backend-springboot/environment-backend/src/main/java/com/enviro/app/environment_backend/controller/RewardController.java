package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.model.Reward;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserReward;
import com.enviro.app.environment_backend.service.RewardService;
import com.enviro.app.environment_backend.service.UserService;
import com.enviro.app.environment_backend.dto.RedeemRewardRequest; // Import DTO mới
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid; // Thêm import validation
import java.util.List;
import java.util.UUID;
import java.util.Map; // Cần cho response JSON

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;
    private final UserService userService;

    public RewardController(RewardService rewardService, UserService userService) {
        this.rewardService = rewardService;
        this.userService = userService;
    }
    
    // Helper function để lấy User (giả định tồn tại trong UserService)
    private User getCurrentUser() {
        return userService.getCurrentUser();
    }


    @GetMapping
    public ResponseEntity<List<Reward>> getAllRewards() {
        return ResponseEntity.ok(rewardService.getAllRewards());
    }

    // CẬP NHẬT: Thay đổi endpoint từ Path Variable sang Body Request để khớp với Frontend
    @PostMapping("/redeem")
    public ResponseEntity<Map<String, Object>> redeemReward(@Valid @RequestBody RedeemRewardRequest request) { 
        User user = getCurrentUser();
        
        // Gọi Service, truyền User object và rewardId
        User updatedUser = rewardService.redeemReward(user, request.getRewardId()); 
        
        // Trả về điểm mới và thông báo cho Frontend
        return ResponseEntity.ok(Map.of(
            "message", "Đổi quà thành công!",
            "newPoints", updatedUser.getPoints()
        ));
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<UserReward>> getHistory() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(rewardService.getUserHistory(user.getId()));
    }
}