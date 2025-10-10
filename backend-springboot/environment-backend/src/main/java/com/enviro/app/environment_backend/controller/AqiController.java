package com.enviro.app.environment_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enviro.app.environment_backend.dto.AqiResponse;
import com.enviro.app.environment_backend.service.AqiService;

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

        // 1. Gọi Service để lấy dữ liệu AQI từ nguồn bên ngoài
        AqiResponse aqiData = aqiService.getCurrentAqiByGps(lat, lon);

        // 2. Xử lý và trả về dữ liệu
        // Nếu không tìm thấy dữ liệu (ví dụ: aqiData == null), bạn có thể trả về 404
        if (aqiData == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(aqiData);
    }
    
    // Bạn có thể thêm API lấy AQI theo khu vực đã lưu trữ ở đây sau (nếu có DB cho khu vực)
}