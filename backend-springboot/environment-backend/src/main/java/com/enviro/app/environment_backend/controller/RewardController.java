package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.RedeemRewardRequest;
import com.enviro.app.environment_backend.dto.RewardResponse;
import com.enviro.app.environment_backend.dto.UserRewardResponse;
import com.enviro.app.environment_backend.model.RewardType;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.RewardService;
import com.enviro.app.environment_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;
    private final UserService userService;

    public RewardController(RewardService rewardService, UserService userService) {
        this.rewardService = rewardService;
        this.userService = userService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    @GetMapping
    public ResponseEntity<List<RewardResponse>> getAllRewards() {
        return ResponseEntity.ok(rewardService.getAllRewards());
    }

    @GetMapping(params = "type")
    public ResponseEntity<List<RewardResponse>> getRewardsByType(@RequestParam RewardType type) {
        return ResponseEntity.ok(rewardService.getRewardsByType(type));
    }

    @PostMapping("/redeem")
    public ResponseEntity<UserRewardResponse> redeemReward(@Valid @RequestBody RedeemRewardRequest request) {
        User user = getCurrentUser();
        return ResponseEntity.ok(rewardService.redeemReward(user, request.getRewardId()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<UserRewardResponse>> getMyRewards() {
        User user = getCurrentUser();
        return ResponseEntity.ok(rewardService.getUserRewards(user));
    }
}

