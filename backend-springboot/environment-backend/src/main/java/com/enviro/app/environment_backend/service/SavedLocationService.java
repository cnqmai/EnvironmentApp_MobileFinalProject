package com.enviro.app.environment_backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enviro.app.environment_backend.dto.AqiResponse;
import com.enviro.app.environment_backend.dto.GeocodingResponse;
import com.enviro.app.environment_backend.dto.SavedLocationAqiResponse;
import com.enviro.app.environment_backend.model.SavedLocation;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.SavedLocationRepository;
import com.enviro.app.environment_backend.repository.UserRepository;

@Service
public class SavedLocationService {

    private final SavedLocationRepository locationRepository;
    private final UserRepository userRepository;
    private final AqiService aqiService; 

    public SavedLocationService(SavedLocationRepository locationRepository, 
                                UserRepository userRepository,
                                AqiService aqiService) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.aqiService = aqiService; 
    }

    @Transactional
    public SavedLocation saveLocation(User user, String name, double lat, double lon) {
        SavedLocation location = SavedLocation.builder()
            .name(name)
            .latitude(lat)
            .longitude(lon)
            .user(user)
            .build();
        return locationRepository.save(location);
    }

    public List<SavedLocation> getLocationsByUser(UUID userId) {
        return locationRepository.findByUserId(userId); 
    }

    /**
     * Lấy AQI cho tất cả vị trí đã lưu VÀ vị trí mặc định trong profile
     */
    public List<SavedLocationAqiResponse> getAqiForAllSavedLocations(UUID userId) {
        List<SavedLocationAqiResponse> responseList = new ArrayList<>();

        // 1. Lấy thông tin User để check default_location
        User user = userRepository.findById(userId).orElse(null);
        
        // --- XỬ LÝ VỊ TRÍ MẶC ĐỊNH (USER PROFILE) ---
        if (user != null && user.getDefaultLocation() != null && !user.getDefaultLocation().isEmpty()) {
            String address = user.getDefaultLocation();
            // Gọi Geocoding để lấy tọa độ từ tên địa chỉ
            GeocodingResponse coords = aqiService.getCoordinatesFromAddress(address);
            
            if (coords != null) {
                // Lấy AQI dựa trên tọa độ vừa tìm được
                AqiResponse aqiData = aqiService.getCurrentAqiByGps(coords.getLat(), coords.getLon());
                
                if (aqiData != null) {
                    responseList.add(SavedLocationAqiResponse.builder()
                        .locationId(null) // Không có ID vì là mặc định
                        .locationName(address + " (Mặc định)")
                        .latitude(coords.getLat())
                        .longitude(coords.getLon())
                        .aqiValue(aqiData.getAqiValue())
                        .status(aqiData.getStatus())
                        .dominantPollutant(aqiData.getDominantPollutant())
                        .healthAdvisory(aqiData.getHealthAdvisory())
                        .timeObservation(aqiData.getTimeObservation())
                        .resolvedCityName(aqiData.getCity())
                        .build());
                }
            }
        }

        // 2. Lấy danh sách từ bảng saved_locations
        List<SavedLocation> savedLocations = locationRepository.findByUserId(userId);
        
        List<SavedLocationAqiResponse> savedList = savedLocations.stream().map(location -> {
            AqiResponse aqiData = aqiService.getCurrentAqiByGps(
                location.getLatitude(), 
                location.getLongitude()
            );

            return SavedLocationAqiResponse.builder()
                .locationId(location.getId())
                .locationName(location.getName())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .aqiValue(aqiData != null ? aqiData.getAqiValue() : -1)
                .status(aqiData != null ? aqiData.getStatus() : "N/A")
                .dominantPollutant(aqiData != null ? aqiData.getDominantPollutant() : "N/A")
                .healthAdvisory(aqiData != null ? aqiData.getHealthAdvisory() : "Không thể lấy dữ liệu.")
                .timeObservation(aqiData != null ? aqiData.getTimeObservation() : "N/A")
                .resolvedCityName(aqiData != null ? aqiData.getCity() : location.getName())
                .build();
        }).collect(Collectors.toList());

        responseList.addAll(savedList);

        return responseList;
    }
}