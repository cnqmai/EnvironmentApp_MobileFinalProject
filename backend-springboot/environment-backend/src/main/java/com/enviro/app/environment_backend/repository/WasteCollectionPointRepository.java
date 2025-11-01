package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.CollectionPointType;
import com.enviro.app.environment_backend.model.WasteCollectionPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WasteCollectionPointRepository extends JpaRepository<WasteCollectionPoint, UUID> {
    
    /**
     * Lấy tất cả collection points đang hoạt động
     */
    List<WasteCollectionPoint> findByIsActiveTrueOrderByNameAsc();
    
    /**
     * Lấy collection points theo loại
     */
    List<WasteCollectionPoint> findByTypeAndIsActiveTrueOrderByNameAsc(CollectionPointType type);
    
    /**
     * Tìm collection points trong bán kính từ vị trí cho trước (sử dụng công thức Haversine)
     * Bán kính tính bằng km
     */
    @Query(value = "SELECT * FROM waste_collection_points WHERE is_active = true " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:lon)) + sin(radians(:lat)) * " +
           "sin(radians(latitude)))) <= :radiusKm " +
           "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:lon)) + sin(radians(:lat)) * " +
           "sin(radians(latitude)))) ASC",
           nativeQuery = true)
    List<WasteCollectionPoint> findNearbyCollectionPoints(
            @Param("lat") double latitude,
            @Param("lon") double longitude,
            @Param("radiusKm") double radiusKm);
    
    /**
     * Tìm collection points theo loại trong bán kính
     */
    @Query(value = "SELECT * FROM waste_collection_points WHERE is_active = true " +
           "AND type = CAST(:type AS collection_point_type) " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:lon)) + sin(radians(:lat)) * " +
           "sin(radians(latitude)))) <= :radiusKm " +
           "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:lon)) + sin(radians(:lat)) * " +
           "sin(radians(latitude)))) ASC",
           nativeQuery = true)
    List<WasteCollectionPoint> findNearbyCollectionPointsByType(
            @Param("lat") double latitude,
            @Param("lon") double longitude,
            @Param("radiusKm") double radiusKm,
            @Param("type") String type);
}

