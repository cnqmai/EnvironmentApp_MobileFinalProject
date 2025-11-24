package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.AqiAlertRequest;
import com.enviro.app.environment_backend.dto.AqiAlertResponse;
import com.enviro.app.environment_backend.dto.AqiResponse;
import com.enviro.app.environment_backend.dto.SavedLocationAqiResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.AqiService;
import com.enviro.app.environment_backend.service.SavedLocationService;
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
@RequestMapping("/api/aqi")
public class AqiController {

    private final AqiService aqiService;
    private final SavedLocationService savedLocationService;
    private final UserService userService;

    // Constructor Injection đầy đủ
    public AqiController(AqiService aqiService, 
                         SavedLocationService savedLocationService, 
                         UserService userService) {
        this.aqiService = aqiService;
        this.savedLocationService = savedLocationService;
        this.userService = userService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    @GetMapping
    public ResponseEntity<AqiResponse> getAqiByGps(@RequestParam double lat, @RequestParam double lon) {
        AqiResponse aqiData = aqiService.getCurrentAqiByGps(lat, lon);
        if (aqiData == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(aqiData);
    }

    // API này sẽ gọi service đã được cập nhật logic
    @GetMapping("/saved-locations")
    public ResponseEntity<List<SavedLocationAqiResponse>> getAqiForSavedLocations() {
        User user = getCurrentUser();
        List<SavedLocationAqiResponse> aqiList = savedLocationService.getAqiForAllSavedLocations(user.getId());
        
        if (aqiList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.ok(aqiList);
    }

    @PostMapping("/check-alert")
    public ResponseEntity<AqiAlertResponse> checkAqiAlert(@Valid @RequestBody AqiAlertRequest request) {
        AqiResponse currentAqi = aqiService.getCurrentAqiByGps(request.getLatitude(), request.getLongitude());

        if (currentAqi == null || currentAqi.getAqiValue() < 0) {
            AqiAlertResponse response = new AqiAlertResponse(false, -1, request.getThreshold(), "Không thể lấy dữ liệu AQI.");
            return ResponseEntity.ok(response);
        }

        int mappedAqiThreshold = mapThresholdLevelToAqi(request.getThreshold());
        boolean shouldAlert = currentAqi.getAqiValue() > mappedAqiThreshold;
        String message = shouldAlert
                ? "Cảnh báo! Chỉ số AQI hiện tại (" + currentAqi.getAqiValue() + ") đã vượt ngưỡng an toàn."
                : "Chất lượng không khí đang trong ngưỡng an toàn.";

        return ResponseEntity.ok(new AqiAlertResponse(shouldAlert, currentAqi.getAqiValue(), request.getThreshold(), message));
    }

    private int mapThresholdLevelToAqi(int level) {
        return switch (Math.max(1, Math.min(level, 5))) {
            case 1 -> 50;
            case 2 -> 100;
            case 3 -> 150;
            case 4 -> 200;
            default -> 300;
        };
    }
}