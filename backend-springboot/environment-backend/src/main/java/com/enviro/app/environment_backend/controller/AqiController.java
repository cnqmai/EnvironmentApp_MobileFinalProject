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
    private final SavedLocationService savedLocationService; // Bổ sung dependency
    private final UserService userService;                 // Bổ sung dependency

    // Cập nhật Constructor để Inject thêm SavedLocationService và UserService
    public AqiController(AqiService aqiService, SavedLocationService savedLocationService, UserService userService) {
        this.aqiService = aqiService;
        this.savedLocationService = savedLocationService;
        this.userService = userService;
    }

    // Helper: Lấy User hiện tại từ JWT
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    /**
     * API Lấy AQI theo Tọa độ GPS (Public API)
     * GET /api/aqi?lat=...&lon=...
     */
    @GetMapping
    public ResponseEntity<AqiResponse> getAqiByGps(
            @RequestParam double lat,
            @RequestParam double lon) {

        AqiResponse aqiData = aqiService.getCurrentAqiByGps(lat, lon);
        if (aqiData == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(aqiData);
    }

    /**
     * [MỚI] API Lấy AQI cho các địa điểm đã lưu
     * GET /api/aqi/saved-locations
     */
    @GetMapping("/saved-locations")
    public ResponseEntity<List<SavedLocationAqiResponse>> getAqiForSavedLocations() {
        User user = getCurrentUser();

        List<SavedLocationAqiResponse> aqiList = savedLocationService.getAqiForAllSavedLocations(user.getId());

        if (aqiList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }

        return ResponseEntity.ok(aqiList);
    }

    /**
     * API Kiểm tra cảnh báo AQI
     * POST /api/aqi/check-alert
     */
    @PostMapping("/check-alert")
    public ResponseEntity<AqiAlertResponse> checkAqiAlert(@Valid @RequestBody AqiAlertRequest request) {
        // 1. Lấy dữ liệu AQI hiện tại
        AqiResponse currentAqi = aqiService.getCurrentAqiByGps(request.getLatitude(), request.getLongitude());

        if (currentAqi == null || currentAqi.getAqiValue() < 0) {
            AqiAlertResponse response = new AqiAlertResponse(
                    false,
                    -1,
                    request.getThreshold(),
                    "Không thể lấy dữ liệu AQI tại vị trí này.");
            return ResponseEntity.ok(response);
        }

        // 2. So sánh với ngưỡng của người dùng
        int mappedAqiThreshold = mapThresholdLevelToAqi(request.getThreshold());
        boolean shouldAlert = currentAqi.getAqiValue() > mappedAqiThreshold;
        String message = shouldAlert
                ? "Cảnh báo! Chỉ số AQI hiện tại (" + currentAqi.getAqiValue() + ") đã vượt ngưỡng an toàn (AQI " + mappedAqiThreshold + ") của bạn."
                : "Chất lượng không khí đang trong ngưỡng an toàn của bạn (AQI ≤ " + mappedAqiThreshold + ").";

        // 3. Xây dựng và trả về phản hồi
        AqiAlertResponse response = new AqiAlertResponse(
                shouldAlert,
                currentAqi.getAqiValue(),
                request.getThreshold(),
                message);

        return ResponseEntity.ok(response);
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