package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.DailyTipResponse;
import com.enviro.app.environment_backend.model.DailyTip;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.DailyTipService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/daily-tips")
public class DailyTipController {

    private final DailyTipService dailyTipService;
    private final UserService userService;

    public DailyTipController(DailyTipService dailyTipService, UserService userService) {
        this.dailyTipService = dailyTipService;
        this.userService = userService;
    }

    @GetMapping("/today")
    public ResponseEntity<DailyTipResponse> getTodayTip() {
        DailyTip tip = dailyTipService.getTodayTip();
        if (tip == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(mapToResponse(tip)); // [FIX] Map to DTO
    }

    @GetMapping
    public ResponseEntity<List<DailyTipResponse>> getAllTips(@RequestParam(required = false) String category) {
        List<DailyTip> tips;
        if (category != null) {
            tips = dailyTipService.getTipsByCategory(category);
        } else {
            tips = dailyTipService.getAllTips();
        }
        // [FIX] Map List<Entity> to List<DTO>
        return ResponseEntity.ok(tips.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<String> completeTip(@PathVariable UUID id) { // [FIX] UUID
        User user = userService.getCurrentUser();
        dailyTipService.markTipAsCompleted(user.getId(), id);
        return ResponseEntity.ok("Ghi nhận thành công!");
    }

    // Helper map Entity -> DTO
    private DailyTipResponse mapToResponse(DailyTip tip) {
        return DailyTipResponse.builder()
                .id(tip.getId())
                .title(tip.getTitle())
                .description(tip.getDescription()) // hoặc .content() tùy Entity của bạn
                .category(tip.getCategory())
                .pointsReward(10) // Hardcode hoặc lấy từ DB
                .build();
    }
}