package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.AqiAlertRequest;
import com.enviro.app.environment_backend.dto.AqiAlertResponse;
import com.enviro.app.environment_backend.dto.AqiResponse;
import com.enviro.app.environment_backend.service.AqiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/aqi")
public class AqiController {

    private final AqiService aqiService;

    public AqiController(AqiService aqiService) {
        this.aqiService = aqiService;
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
     * THÊM MỚI: API Kiểm tra cảnh báo AQI
     * POST /api/aqi/check-alert
     */
    @PostMapping("/check-alert")
    public ResponseEntity<AqiAlertResponse> checkAqiAlert(@Valid @RequestBody AqiAlertRequest request) {
        // 1. Lấy dữ liệu AQI hiện tại
        AqiResponse currentAqi = aqiService.getCurrentAqiByGps(request.getLatitude(), request.getLongitude());

        if (currentAqi == null || currentAqi.getAqiValue() < 0) {
            // Xử lý trường hợp không lấy được dữ liệu AQI
            AqiAlertResponse response = AqiAlertResponse.builder()
                    .alert(false)
                    .currentAqi(-1)
                    .userThreshold(request.getThreshold())
                    .message("Không thể lấy dữ liệu AQI tại vị trí này.")
                    .build();
            return ResponseEntity.ok(response);
        }

        // 2. So sánh với ngưỡng của người dùng
        boolean shouldAlert = currentAqi.getAqiValue() > request.getThreshold();
        String message = shouldAlert
                ? "Cảnh báo! Chỉ số AQI hiện tại (" + currentAqi.getAqiValue() + ") đã vượt ngưỡng an toàn (" + request.getThreshold() + ") của bạn."
                : "Chất lượng không khí trong ngưỡng an toàn của bạn.";

        // 3. Xây dựng và trả về phản hồi
        AqiAlertResponse response = AqiAlertResponse.builder()
                .alert(shouldAlert)
                .currentAqi(currentAqi.getAqiValue())
                .userThreshold(request.getThreshold())
                .message(message)
                .build();

        return ResponseEntity.ok(response);
    }
}