package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.CollectionPointResponse;
import com.enviro.app.environment_backend.model.CollectionPointType;
import com.enviro.app.environment_backend.service.CollectionPointService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến Map Collection Points (FR-10.1.1, FR-10.1.2)
 */
@RestController
@RequestMapping("/api/collection-points")
public class CollectionPointController {

    private final CollectionPointService collectionPointService;

    public CollectionPointController(CollectionPointService collectionPointService) {
        this.collectionPointService = collectionPointService;
    }

    /**
     * API LẤY TẤT CẢ COLLECTION POINTS (FR-10.1.1)
     * GET /api/collection-points
     */
    @GetMapping
    public ResponseEntity<List<CollectionPointResponse>> getAllCollectionPoints() {
        List<CollectionPointResponse> points = collectionPointService.getAllCollectionPoints();
        return ResponseEntity.ok(points);
    }

    /**
     * API LẤY COLLECTION POINTS THEO LOẠI (FR-10.1.2)
     * GET /api/collection-points?type=PLASTIC
     */
    @GetMapping(params = "type")
    public ResponseEntity<List<CollectionPointResponse>> getCollectionPointsByType(
            @RequestParam CollectionPointType type) {
        List<CollectionPointResponse> points = collectionPointService.getCollectionPointsByType(type);
        return ResponseEntity.ok(points);
    }

    /**
     * API TÌM COLLECTION POINTS GẦN VỊ TRÍ (FR-10.1.1)
     * GET /api/collection-points/nearby?lat=...&lon=...&radius=10
     * radius mặc định là 10km
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<CollectionPointResponse>> getNearbyCollectionPoints(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") double radius) {
        List<CollectionPointResponse> points = collectionPointService.getNearbyCollectionPoints(
                lat, lon, radius);
        return ResponseEntity.ok(points);
    }

    /**
     * API TÌM COLLECTION POINTS GẦN VỊ TRÍ THEO LOẠI (FR-10.1.2)
     * GET /api/collection-points/nearby?lat=...&lon=...&radius=10&type=PLASTIC
     */
    @GetMapping(value = "/nearby", params = {"type"})
    public ResponseEntity<List<CollectionPointResponse>> getNearbyCollectionPointsByType(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") double radius,
            @RequestParam CollectionPointType type) {
        List<CollectionPointResponse> points = collectionPointService.getNearbyCollectionPointsByType(
                lat, lon, radius, type);
        return ResponseEntity.ok(points);
    }
}

