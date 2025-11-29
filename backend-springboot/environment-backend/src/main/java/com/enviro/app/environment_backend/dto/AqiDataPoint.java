package com.enviro.app.environment_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class AqiDataPoint {
    private long dt;
    private Main main; // Chứa AQI 1-5
    private Map<String, Double> components; // Chứa nồng độ PM2.5, CO, O3, v.v.

    @Data
    public static class Main {
        private int aqi;
    }
}