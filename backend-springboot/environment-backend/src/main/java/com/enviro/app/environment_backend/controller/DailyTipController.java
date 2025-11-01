package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.DailyTipResponse;
import com.enviro.app.environment_backend.service.DailyTipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/daily-tips")
public class DailyTipController {

    private final DailyTipService dailyTipService;

    public DailyTipController(DailyTipService dailyTipService) {
        this.dailyTipService = dailyTipService;
    }

    @GetMapping("/today")
    public ResponseEntity<DailyTipResponse> getTodayTip() {
        return ResponseEntity.ok(dailyTipService.getTodayTip());
    }

    @GetMapping
    public ResponseEntity<List<DailyTipResponse>> getAllTips() {
        return ResponseEntity.ok(dailyTipService.getAllTips());
    }

    @GetMapping(params = "category")
    public ResponseEntity<List<DailyTipResponse>> getTipsByCategory(@RequestParam String category) {
        return ResponseEntity.ok(dailyTipService.getTipsByCategory(category));
    }
}

