package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.AqiDataPoint;
import com.enviro.app.environment_backend.dto.AqiResponse;
import com.enviro.app.environment_backend.dto.GeocodingResponse;
import com.enviro.app.environment_backend.dto.OpenWeatherMapResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
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

    /**
     * Lấy thông tin AQI theo tọa độ GPS
     */
    public AqiResponse getCurrentAqiByGps(double lat, double lon) {
        // Sử dụng Locale.US để đảm bảo lat/lon dùng dấu chấm (10.75) thay vì dấu phẩy (10,75)
        String url = String.format(Locale.US, "%s?lat=%f&lon=%f&appid=%s", baseUrl, lat, lon, apiKey);
        try {
            OpenWeatherMapResponse response = restTemplate.getForObject(url, OpenWeatherMapResponse.class);

            if (response != null && response.getList() != null && !response.getList().isEmpty()) {
                AqiDataPoint dataPoint = response.getList().get(0);
                
                int aqi = dataPoint.getMain().getAqi();
                Map<String, Double> components = dataPoint.getComponents();
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
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Tìm tọa độ từ địa chỉ (Có cơ chế thử lại và chuẩn hóa tên thông minh)
     */
    public GeocodingResponse getCoordinatesFromAddress(String address) {
        // 1. Chuẩn hóa địa chỉ trước khi tìm
        String searchAddress = normalizeAddress(address);
        System.out.println("Searching for: " + searchAddress); // Log để debug
        
        // Lần 1: Tìm chính xác
        GeocodingResponse result = callGeocodingApi(searchAddress);

        // Lần 2: Rút gọn nếu có dấu phẩy
        if (result == null && searchAddress.contains(",")) {
            String[] parts = searchAddress.split(",", 2);
            if (parts.length > 1) {
                String simplified = parts[1].trim();
                System.out.println("Retry 1 (Simplified): " + simplified);
                result = callGeocodingApi(simplified);
                
                // Lần 3: Rút gọn tiếp (cấp thành phố/quốc gia)
                if (result == null && simplified.contains(",")) {
                    String[] parts2 = simplified.split(",", 2);
                    if (parts2.length > 1) {
                        String evenSimpler = parts2[1].trim();
                        System.out.println("Retry 2 (City/Country): " + evenSimpler);
                        result = callGeocodingApi(evenSimpler);
                    }
                }
            }
        }
        return result;
    }

    // --- CẬP NHẬT: Hàm chuẩn hóa địa chỉ tốt hơn ---
    private String normalizeAddress(String address) {
        if (address == null) return "";
        String normalized = address;
        
        // 1. Thay thế các từ khóa tiếng Việt sang định dạng quốc tế mà API hiểu rõ hơn
        normalized = normalized.replace("Thành Phố Hồ Chí Minh", "Ho Chi Minh City");
        normalized = normalized.replace("TP.HCM", "Ho Chi Minh City");
        normalized = normalized.replace("Thành phố Hồ Chí Minh", "Ho Chi Minh City");
        normalized = normalized.replace("Tỉnh", "");
        normalized = normalized.replace("Thành phố", ""); 

        // 2. Xử lý trường hợp bị lặp từ (nguyên nhân gây lỗi trước đó)
        // Ví dụ: "Hồ Chí Minh, Ho Chi Minh City" -> Xóa "Hồ Chí Minh"
        if (normalized.contains("Ho Chi Minh City")) {
            normalized = normalized.replace("Hồ Chí Minh", ""); 
        }

        // 3. Dọn dẹp dấu phẩy thừa (,, -> ,) và khoảng trắng
        normalized = normalized.replaceAll(",\\s*,", ","); // Xóa phẩy kép
        normalized = normalized.replaceAll("^,", "");       // Xóa phẩy đầu dòng
        
        return normalized.trim();
    }

    private GeocodingResponse callGeocodingApi(String address) {
        String directGeoUrl = "http://api.openweathermap.org/geo/1.0/direct";
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(directGeoUrl)
                    .queryParam("q", address)
                    .queryParam("limit", 1)
                    .queryParam("appid", apiKey)
                    .build()
                    .toUri();

            GeocodingResponse[] responses = restTemplate.getForObject(uri, GeocodingResponse[].class);

            if (responses != null && responses.length > 0) {
                return responses[0];
            }
        } catch (Exception e) {
            System.out.println("Geocoding Warning: Không tìm thấy '" + address + "'");
        }
        return null;
    }

    private String getCityNameFromGps(double lat, double lon) {
        try {
            URI uri = UriComponentsBuilder.fromUriString(geocodingUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("limit", 1)
                .queryParam("appid", apiKey)
                .build()
                .toUri();

            GeocodingResponse[] responses = restTemplate.getForObject(uri, GeocodingResponse[].class);
            if (responses != null && responses.length > 0) {
                return responses[0].getName();
            }
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
        return Instant.ofEpochSecond(unixSeconds)
            .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
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