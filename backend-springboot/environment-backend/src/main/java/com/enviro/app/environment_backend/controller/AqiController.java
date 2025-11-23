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

    @PostMapping("/check-alert")
    public ResponseEntity<AqiAlertResponse> checkAqiAlert(@Valid @RequestBody AqiAlertRequest request) {
        AqiResponse currentAqi = aqiService.getCurrentAqiByGps(request.getLatitude(), request.getLongitude());

        if (currentAqi == null || currentAqi.getAqiValue() < 0) {
            AqiAlertResponse response = new AqiAlertResponse(
                    false,
                    -1,
                    request.getThreshold(),
                    "Không thể lấy dữ liệu AQI tại vị trí này.");
            return ResponseEntity.ok(response);
        }

        int mappedAqiThreshold = mapThresholdLevelToAqi(request.getThreshold());
        boolean shouldAlert = currentAqi.getAqiValue() > mappedAqiThreshold;
        String message = shouldAlert
                ? "Cảnh báo! Chỉ số AQI hiện tại (" + currentAqi.getAqiValue() + ") đã vượt ngưỡng an toàn (AQI " + mappedAqiThreshold + ") của bạn."
                : "Chất lượng không khí đang trong ngưỡng an toàn của bạn (AQI ≤ " + mappedAqiThreshold + ").";

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