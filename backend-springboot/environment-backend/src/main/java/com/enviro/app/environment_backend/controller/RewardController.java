package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.model.Reward;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserReward;
import com.enviro.app.environment_backend.service.RewardService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;
    private final UserService userService;

    public RewardController(RewardService rewardService, UserService userService) {
        this.rewardService = rewardService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Reward>> getAllRewards() {
        return ResponseEntity.ok(rewardService.getAllRewards());
    }

    @PostMapping("/{id}/redeem")
    public ResponseEntity<String> redeemReward(@PathVariable UUID id) { // [FIX] UUID
        User user = userService.getCurrentUser();
        rewardService.redeemReward(user.getId(), id);
        return ResponseEntity.ok("Đổi quà thành công!");
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<UserReward>> getHistory() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(rewardService.getUserHistory(user.getId()));
    }
}