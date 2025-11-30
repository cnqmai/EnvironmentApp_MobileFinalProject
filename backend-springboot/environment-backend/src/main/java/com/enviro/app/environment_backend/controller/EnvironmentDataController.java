package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.GeocodingResponse;
import com.enviro.app.environment_backend.dto.NoiseResponse;
import com.enviro.app.environment_backend.dto.WaterQualityResponse;
import com.enviro.app.environment_backend.service.AqiService;
import com.enviro.app.environment_backend.service.NoiseService;
import com.enviro.app.environment_backend.service.WaterQualityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/environmental-data") // Đổi base path để chứa nhiều loại dữ liệu
public class EnvironmentDataController {

    private final NoiseService noiseService;
    private final WaterQualityService waterQualityService;
    private final AqiService aqiService;

    public EnvironmentDataController(NoiseService noiseService, 
                                     WaterQualityService waterQualityService,
                                     AqiService aqiService) {
        this.noiseService = noiseService;
        this.waterQualityService = waterQualityService;
        this.aqiService = aqiService;
    }

    // API 1: Lấy chỉ số Tiếng ồn hiện tại
    @GetMapping("/noise")
    public ResponseEntity<NoiseResponse> getNoiseByGps(@RequestParam double lat, @RequestParam double lon) {
        NoiseResponse data = noiseService.getCurrentNoiseByGps(lat, lon);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(data);
    }

    // API 2: Lấy chỉ số Chất lượng nước hiện tại
    @GetMapping("/water")
    public ResponseEntity<WaterQualityResponse> getWaterQualityByGps(@RequestParam double lat, @RequestParam double lon) {
        WaterQualityResponse data = waterQualityService.getCurrentWaterQualityByGps(lat, lon);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(data);
    }
    
    // API MỚI: GEOCONDING (Tìm tọa độ từ địa chỉ)
    @GetMapping("/geocode")
    public ResponseEntity<GeocodingResponse> getCoordinatesFromAddress(@RequestParam String address) {
        // Gọi service để tìm tọa độ
        GeocodingResponse coords = aqiService.getCoordinatesFromAddress(address);
        
        if (coords == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(coords);
    }
}