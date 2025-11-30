package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

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

    public int getAqiValue() {
        return aqiValue;
    }
}