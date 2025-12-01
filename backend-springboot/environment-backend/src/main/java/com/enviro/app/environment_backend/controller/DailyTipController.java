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
@RequestMapping("/api/tips")
public class DailyTipController {

    private final DailyTipService dailyTipService;
    private final UserService userService;

    public DailyTipController(DailyTipService dailyTipService, UserService userService) {
        this.dailyTipService = dailyTipService;
        this.userService = userService;
    }

    @GetMapping("/random")
    public ResponseEntity<DailyTipResponse> getRandomTip() {
        DailyTip tip = dailyTipService.getRandomTip();
        if (tip == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(mapToResponse(tip));
    }

    @GetMapping("/today")
    public ResponseEntity<DailyTipResponse> getTodayTip() {
        DailyTip tip = dailyTipService.getTodayTip();
        if (tip == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(mapToResponse(tip));
    }

    @GetMapping
    public ResponseEntity<List<DailyTipResponse>> getAllTips(@RequestParam(required = false) String category) {
        List<DailyTip> tips;
        if (category != null) {
            tips = dailyTipService.getTipsByCategory(category);
        } else {
            tips = dailyTipService.getAllTips();
        }
        return ResponseEntity.ok(tips.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<String> completeTip(@PathVariable UUID id) {
        User user = userService.getCurrentUser();
        dailyTipService.markTipAsCompleted(user.getId(), id);
        return ResponseEntity.ok("Ghi nhận thành công! (+10 điểm)");
    }

    private DailyTipResponse mapToResponse(DailyTip tip) {
        return DailyTipResponse.builder()
                .id(tip.getId())
                .title(tip.getTitle())
                .description(tip.getDescription()) 
                // .content(...) -> ĐÃ XÓA dòng này vì DTO không có field 'content'
                .category(tip.getCategory())
                .pointsReward(tip.getPointsReward() != null ? tip.getPointsReward() : 10)
                .iconUrl(tip.getIconUrl()) // -> ĐÃ SỬA: Dùng .iconUrl() thay vì .imageUrl()
                .build();
    }
}