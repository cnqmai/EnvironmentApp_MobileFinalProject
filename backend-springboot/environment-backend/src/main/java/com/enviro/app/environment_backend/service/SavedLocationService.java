package com.enviro.app.environment_backend.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enviro.app.environment_backend.dto.AqiResponse;
import com.enviro.app.environment_backend.dto.SavedLocationAqiResponse;
import com.enviro.app.environment_backend.model.SavedLocation;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.SavedLocationRepository;

@Service
public class SavedLocationService {

    private final SavedLocationRepository locationRepository;
    private final AqiService aqiService; 

    // Constructor Injection
    public SavedLocationService(SavedLocationRepository locationRepository, AqiService aqiService) {
        this.locationRepository = locationRepository;
        this.aqiService = aqiService; 
    }

    /**
     * Lưu một vị trí mới cho người dùng.
     */
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

    /**
     * Lấy tất cả các vị trí đã lưu của một người dùng.
     */
    public List<SavedLocation> getLocationsByUser(UUID userId) {
        // DÒNG NÀY KHỚP VỚI LỖI MÀ BẠN GẶP
        return locationRepository.findByUserId(userId); 
    }

    /**
     * Lấy AQI hiện tại cho TẤT CẢ các vị trí đã lưu của một người dùng.
     */
    public List<SavedLocationAqiResponse> getAqiForAllSavedLocations(UUID userId) {
        
        List<SavedLocation> savedLocations = locationRepository.findByUserId(userId);
        
        return savedLocations.stream().map(location -> {
            
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
                .healthAdvisory(aqiData != null ? aqiData.getHealthAdvisory() : "Không thể lấy dữ liệu AQI.")
                .timeObservation(aqiData != null ? aqiData.getTimeObservation() : "N/A")
                .resolvedCityName(aqiData != null ? aqiData.getCity() : location.getName())
                .build();
            
        }).collect(Collectors.toList());
    }
}