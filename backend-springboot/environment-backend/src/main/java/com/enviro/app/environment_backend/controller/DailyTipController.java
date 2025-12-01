package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.DailyTipResponse;
import com.enviro.app.environment_backend.service.DailyTipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/daily-tips")
public class DailyTipController {

    private final DailyTipService dailyTipService;

    @Autowired
    public DailyTipController(DailyTipService dailyTipService) {
        this.dailyTipService = dailyTipService;
    }

    @GetMapping
    public ResponseEntity<List<DailyTipResponse>> getAllTips() {
        List<DailyTipResponse> tips = dailyTipService.getAllTips();
        return ResponseEntity.ok(tips);
    }
    
    // Endpoint để lấy mẹo hôm nay
    @GetMapping("/today")
    public ResponseEntity<DailyTipResponse> getDailyTip() {
        DailyTipResponse tip = dailyTipService.getDailyTip();
        return ResponseEntity.ok(tip);
    }

    // Endpoint để người dùng claim phần thưởng Daily Tip
    @PostMapping("/{userId}/claim")
    public ResponseEntity<DailyTipResponse> claimDailyTipReward(@PathVariable UUID userId) {
        DailyTipResponse claimedTip = dailyTipService.claimDailyTipReward(userId);
        return ResponseEntity.ok(claimedTip);
    }
}