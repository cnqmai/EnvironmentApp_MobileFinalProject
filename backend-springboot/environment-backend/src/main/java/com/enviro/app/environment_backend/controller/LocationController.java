package com.enviro.app.environment_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.enviro.app.environment_backend.dto.LocationRequest;
import com.enviro.app.environment_backend.dto.SavedLocationAqiResponse; // Import DTO phản hồi AQI mới
import com.enviro.app.environment_backend.model.SavedLocation;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.SavedLocationService;
import com.enviro.app.environment_backend.service.UserService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final SavedLocationService locationService;
    private final UserService userService;

    public LocationController(SavedLocationService locationService, UserService userService) {
        this.locationService = locationService;
        this.userService = userService;
    }

    // Phương thức tiện ích để lấy User đang đăng nhập từ JWT Token
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Giả sử Principal là email (tên người dùng)
        String userEmail = authentication.getName(); 
        
        return userService.findByEmail(userEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    /**
     * 1. API Lưu Vị trí (Protected - POST /api/locations)
     */
    @PostMapping
    public ResponseEntity<SavedLocation> saveLocation(@Valid @RequestBody LocationRequest request) {
        User user = getCurrentUser();

        SavedLocation savedLocation = locationService.saveLocation(
            user, 
            request.getName(), 
            request.getLatitude(), 
            request.getLongitude()
        );
        return new ResponseEntity<>(savedLocation, HttpStatus.CREATED);
    }

    /**
     * 2. API Lấy Danh sách Vị trí Đã Lưu (Protected - GET /api/locations)
     */
    @GetMapping
    public ResponseEntity<List<SavedLocation>> getSavedLocations() {
        User user = getCurrentUser();
        List<SavedLocation> locations = locationService.getLocationsByUser(user.getId());
        return ResponseEntity.ok(locations);
    }
    
    /**
     * 3. API Lấy AQI cho tất cả các Vị trí đã Lưu (Protected - GET /api/locations/aqi)
     */
    @GetMapping("/aqi")
    public ResponseEntity<List<SavedLocationAqiResponse>> getAqiForSavedLocations() {
        User user = getCurrentUser(); // Lấy User từ JWT Token
        
        List<SavedLocationAqiResponse> aqiList = locationService.getAqiForAllSavedLocations(user.getId());
        
        if (aqiList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // Mã 204 nếu danh sách trống
        }
        
        return ResponseEntity.ok(aqiList);
    }
}