package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;
import java.util.Map; // Import Map

@Value
@Builder
public class AqiResponse {
    int aqiValue;
    String status;
    String dominantPollutant;
    double latitude;
    double longitude;
    String city; 
    String healthAdvisory;
    String timeObservation;
    
    // --- FIX LỖI: Thêm trường components để SavedLocationService gọi được ---
    Map<String, Double> components; 

    public int getAqiValue() {
        return aqiValue;
    }

    // Alias cho Controller
    public int getCalculatedAqiValue() {
        return aqiValue;
    }
    
    // --- FIX LỖI: Getter cho components ---
    public Map<String, Double> getComponents() {
        return components;
    }
}