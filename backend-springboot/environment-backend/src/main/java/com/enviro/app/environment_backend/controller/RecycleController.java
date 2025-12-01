package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.RecycleService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recycle")
public class RecycleController {

    private final RecycleService recycleService;
    private final UserService userService;

    public RecycleController(RecycleService recycleService, UserService userService) {
        this.recycleService = recycleService;
        this.userService = userService;
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmRecycle(@RequestBody Map<String, String> payload) {
        User user = userService.getCurrentUser();
        String wasteType = payload.get("wasteType"); // Nhận loại rác từ client (để log nếu cần)
        
        int newPoints = recycleService.confirmRecycle(user, wasteType);
        
        return ResponseEntity.ok(Map.of(
            "message", "Cộng điểm thành công!",
            "pointsAdded", 5,
            "totalPoints", newPoints
        ));
    }
}