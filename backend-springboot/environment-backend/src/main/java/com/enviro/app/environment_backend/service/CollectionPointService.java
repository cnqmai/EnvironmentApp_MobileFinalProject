package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.CollectionPointResponse;
import com.enviro.app.environment_backend.model.CollectionPointType;
import com.enviro.app.environment_backend.model.WasteCollectionPoint;
import com.enviro.app.environment_backend.repository.WasteCollectionPointRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý logic cho Map Collection Points (FR-10.1.1, FR-10.1.2)
 */
@Service
public class CollectionPointService {

    private final WasteCollectionPointRepository repository;

    public CollectionPointService(WasteCollectionPointRepository repository) {
        this.repository = repository;
    }

    /**
     * Lấy tất cả collection points (FR-10.1.1)
     */
    public List<CollectionPointResponse> getAllCollectionPoints() {
        List<WasteCollectionPoint> points = repository.findByIsActiveTrueOrderByNameAsc();
        return points.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy collection points theo loại (FR-10.1.2)
     */
    public List<CollectionPointResponse> getCollectionPointsByType(CollectionPointType type) {
        List<WasteCollectionPoint> points = repository.findByTypeAndIsActiveTrueOrderByNameAsc(type);
        return points.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tìm collection points gần vị trí hiện tại (FR-10.1.1)
     * @param latitude Vĩ độ
     * @param longitude Kinh độ
     * @param radiusKm Bán kính tìm kiếm (km), mặc định 10km
     */
    public List<CollectionPointResponse> getNearbyCollectionPoints(double latitude, double longitude, double radiusKm) {
        List<WasteCollectionPoint> points = repository.findNearbyCollectionPoints(latitude, longitude, radiusKm);
        return points.stream()
                .map(point -> mapToResponseWithDistance(point, latitude, longitude))
                .collect(Collectors.toList());
    }

    /**
     * Tìm collection points gần vị trí theo loại (FR-10.1.2)
     */
    public List<CollectionPointResponse> getNearbyCollectionPointsByType(
            double latitude, double longitude, double radiusKm, CollectionPointType type) {
        List<WasteCollectionPoint> points = repository.findNearbyCollectionPointsByType(
                latitude, longitude, radiusKm, type.name().toLowerCase());
        return points.stream()
                .map(point -> mapToResponseWithDistance(point, latitude, longitude))
                .collect(Collectors.toList());
    }

    /**
     * Map WasteCollectionPoint entity sang CollectionPointResponse DTO
     */
    private CollectionPointResponse mapToResponse(WasteCollectionPoint point) {
        return CollectionPointResponse.builder()
                .id(point.getId())
                .name(point.getName())
                .type(point.getType())
                .latitude(point.getLatitude())
                .longitude(point.getLongitude())
                .address(point.getAddress())
                .description(point.getDescription())
                .phoneNumber(point.getPhoneNumber())
                .openingHours(point.getOpeningHours())
                .isActive(point.getIsActive())
                .distanceKm(null) // Không có thông tin khoảng cách
                .createdAt(point.getCreatedAt())
                .updatedAt(point.getUpdatedAt())
                .build();
    }

    /**
     * Map với tính toán khoảng cách
     */
    private CollectionPointResponse mapToResponseWithDistance(
            WasteCollectionPoint point, double userLat, double userLon) {
        double distance = calculateDistance(userLat, userLon, point.getLatitude(), point.getLongitude());
        
        return CollectionPointResponse.builder()
                .id(point.getId())
                .name(point.getName())
                .type(point.getType())
                .latitude(point.getLatitude())
                .longitude(point.getLongitude())
                .address(point.getAddress())
                .description(point.getDescription())
                .phoneNumber(point.getPhoneNumber())
                .openingHours(point.getOpeningHours())
                .isActive(point.getIsActive())
                .distanceKm(distance)
                .createdAt(point.getCreatedAt())
                .updatedAt(point.getUpdatedAt())
                .build();
    }

    /**
     * Tính khoảng cách giữa 2 điểm GPS (Haversine formula)
     * Trả về khoảng cách tính bằng km
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Bán kính Trái Đất (km)

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

