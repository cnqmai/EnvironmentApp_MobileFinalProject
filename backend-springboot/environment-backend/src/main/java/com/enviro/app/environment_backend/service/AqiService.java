package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.AqiDataPoint;
import com.enviro.app.environment_backend.dto.AqiResponse;
import com.enviro.app.environment_backend.dto.GeocodingResponse;
import com.enviro.app.environment_backend.dto.OpenWeatherMapResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class AqiService {

    @Value("${aqi.api.key}")
    private String apiKey;

    @Value("${aqi.api.base-url}")
    private String baseUrl;

    @Value("${aqi.api.geocoding-url}")
    private String geocodingUrl;

    private final RestTemplate restTemplate;

    public AqiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AqiResponse getCurrentAqiByGps(double lat, double lon) {
        String url = String.format("%s?lat=%s&lon=%s&appid=%s", baseUrl, lat, lon, apiKey);
        try {
            OpenWeatherMapResponse response = restTemplate.getForObject(url, OpenWeatherMapResponse.class);

            if (response != null && response.getList() != null && !response.getList().isEmpty()) {
                AqiDataPoint dataPoint = response.getList().get(0);
                
                int aqi = dataPoint.getMain().getAqi();
                Map<String, Double> components = dataPoint.getComponents(); // Lấy components
                long dt = dataPoint.getDt();
                String city = getCityNameFromGps(lat, lon);

                return AqiResponse.builder()
                        .aqiValue(aqi)
                        .status(mapAqiToStatus(aqi))
                        .dominantPollutant(findDominantPollutant(components))
                        .latitude(lat)
                        .longitude(lon)
                        .city(city)
                        .timeObservation(convertUnixTime(dt))
                        .healthAdvisory(getHealthAdvisory(aqi))
                        .components(components) // --- FIX LỖI: Map components vào DTO ---
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public GeocodingResponse getCoordinatesFromAddress(String address) {
        GeocodingResponse result = callGeocodingApi(address);
        if (result == null && address.contains(",")) {
            String[] parts = address.split(",", 2);
            if (parts.length > 1) {
                String simplifiedAddress = parts[1].trim();
                result = callGeocodingApi(simplifiedAddress);
                if (result == null && simplifiedAddress.contains(",")) {
                    String[] parts2 = simplifiedAddress.split(",", 2);
                    if (parts2.length > 1) {
                        result = callGeocodingApi(parts2[1].trim());
                    }
                }
            }
        }
        return result;
    }

    // --- FIX LỖI: Hàm này phải là public để NotificationScheduler gọi được ---
    public GeocodingResponse geocodeAddress(String address) {
        return getCoordinatesFromAddress(address);
    }

    private GeocodingResponse callGeocodingApi(String address) {
        String directGeoUrl = "http://api.openweathermap.org/geo/1.0/direct";
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(directGeoUrl)
                    .queryParam("q", address)
                    .queryParam("limit", 1)
                    .queryParam("appid", apiKey)
                    .build().toUri();
            ResponseEntity<GeocodingResponse[]> responseEntity = restTemplate.getForEntity(uri, GeocodingResponse[].class);
            GeocodingResponse[] responses = responseEntity.getBody();
            if (responses != null && responses.length > 0) return responses[0];
        } catch (Exception e) {
            System.err.println("Geocoding API error: " + e.getMessage());
        }
        return null;
    }

    private String getCityNameFromGps(double lat, double lon) {
        try {
            URI uri = UriComponentsBuilder.fromUriString(geocodingUrl)
                .queryParam("lat", lat).queryParam("lon", lon).queryParam("limit", 1).queryParam("appid", apiKey)
                .build().toUri();
            GeocodingResponse[] responses = restTemplate.getForObject(uri, GeocodingResponse[].class);
            if (responses != null && responses.length > 0) return responses[0].getName();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "Unknown Location";
    }

    private String mapAqiToStatus(int aqi) {
        return switch (aqi) {
            case 1 -> "Good";
            case 2 -> "Fair";
            case 3 -> "Moderate";
            case 4 -> "Poor";
            case 5 -> "Very Poor";
            default -> "Unknown";
        };
    }

    private String findDominantPollutant(Map<String, Double> components) {
        if (components == null) return "N/A";
        if (components.containsKey("pm2_5")) return "PM2.5";
        if (components.containsKey("pm10")) return "PM10";
        return "N/A";
    }

    private String convertUnixTime(long unixSeconds) {
        return Instant.ofEpochSecond(unixSeconds).atZone(ZoneId.of("Asia/Ho_Chi_Minh")).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    private String getHealthAdvisory(int aqi) {
        return switch (aqi) {
            case 1 -> "Chất lượng không khí tốt.";
            case 2 -> "Chấp nhận được.";
            case 3 -> "Nhóm nhạy cảm nên hạn chế ra ngoài.";
            case 4 -> "Không khí kém, hạn chế ra ngoài.";
            case 5 -> "Nguy hại, tránh ra ngoài.";
            default -> "Không có dữ liệu.";
        };
    }
}