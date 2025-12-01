package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.RecycleService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    // [MỚI] API Nhận diện rác qua ảnh
    // POST /api/recycle/identify
    @PostMapping(value = "/identify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> identifyWaste(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = recycleService.identifyWaste(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi xử lý hình ảnh: " + e.getMessage()));
        }
    }

    // API Xác nhận và cộng điểm
    // POST /api/recycle/confirm
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmRecycle(@RequestBody Map<String, String> payload) {
        User user = userService.getCurrentUser();
        String wasteType = payload.get("wasteType");
        
        int newPoints = recycleService.confirmRecycle(user, wasteType);
        
        return ResponseEntity.ok(Map.of(
            "message", "Cộng điểm thành công!",
            "pointsAdded", 5,
            "totalPoints", newPoints
        ));
    }
}