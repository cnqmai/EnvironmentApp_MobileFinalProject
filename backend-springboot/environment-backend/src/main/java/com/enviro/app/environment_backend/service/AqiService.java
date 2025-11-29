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

    // --- HẰNG SỐ BREAKPOINT US AQI (Chỉ dùng PM2.5 và PM10) ---
    private static final Map<String, Object[]> AQI_BREAKPOINTS = Map.of(
        "PM2.5", new Object[][] {
            {0, 50, 0.0, 12.0}, {51, 100, 12.1, 35.4}, {101, 150, 35.5, 55.4},
            {151, 200, 55.5, 150.4}, {201, 300, 150.5, 250.4}, {301, 500, 250.5, 500.4}
        },
        "PM10", new Object[][] {
            {0, 50, 0, 54}, {51, 100, 55, 154}, {101, 150, 155, 254},
            {151, 200, 255, 354}, {201, 300, 355, 424}, {301, 500, 425, 604}
        }
    );

    public AqiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * TÍNH AQI CHUẨN MỸ (0-500) từ nồng độ ô nhiễm thô.
     */
    private int calculateUsaAqi(Map<String, Double> components) {
        int maxAqi = 0;

        // Tính IAQI (Individual AQI) cho PM2.5
        Double pm25 = components.get("pm2_5");
        if (pm25 != null) {
            maxAqi = Math.max(maxAqi, calculateIAQI(pm25, (Object[][]) AQI_BREAKPOINTS.get("PM2.5")));
        }

        // Tính IAQI cho PM10
        Double pm10 = components.get("pm10");
        if (pm10 != null) {
            maxAqi = Math.max(maxAqi, calculateIAQI(pm10, (Object[][]) AQI_BREAKPOINTS.get("PM10")));
        }
        
        return maxAqi;
    }

    /**
     * Áp dụng công thức OWM cho một chất ô nhiễm (Công thức OAUTH2 đã cung cấp)
     */
    private int calculateIAQI(double C, Object[][] breakpoints) {
        for (Object[] bp : breakpoints) {
            int Ilow = (int) bp[0];
            int Ihigh = (int) bp[1];
            double Clow = ((Number) bp[2]).doubleValue();
            double Chigh = ((Number) bp[3]).doubleValue();

            if (C >= Clow && C <= Chigh) {
                double aqi = ((double) (Ihigh - Ilow) / (Chigh - Clow)) * (C - Clow) + Ilow;
                return (int) Math.round(aqi);
            }
        }
        return C > ((Number) breakpoints[breakpoints.length - 1][3]).doubleValue() ? 500 : 0;
    }


    // =======================================================
    // --- CÁC HÀM PUBLIC (ENTRY POINTS) ---
    // =======================================================

    /**
     * Lấy thông tin AQI theo tọa độ GPS (Đã sửa để dùng tính toán AQI 0-500)
     */
    public AqiResponse getCurrentAqiByGps(double lat, double lon) {
        String url = String.format("%s?lat=%s&lon=%s&appid=%s", baseUrl, lat, lon, apiKey);
        try {
            // Sửa DTO hứng response: Hứng toàn bộ list
            ResponseEntity<OpenWeatherMapResponse> responseEntity = restTemplate.getForEntity(url, OpenWeatherMapResponse.class);
            OpenWeatherMapResponse response = responseEntity.getBody();

            if (response != null && response.getList() != null && !response.getList().isEmpty()) {
                AqiDataPoint dataPoint = response.getList().get(0);
                
                // 1. Lấy dữ liệu thô
                Map<String, Double> components = dataPoint.getComponents();
                // --- THÊM DÒNG DEBUG NÀY ---
                System.out.println(">>> [AQI DEBUG] Nồng độ PM2.5: " + components.get("pm2_5"));
                System.out.println(">>> [AQI DEBUG] Nồng độ PM10: " + components.get("pm10"));
                // ----------------------------
                int owmAqi = dataPoint.getMain().getAqi(); // Thang 1-5
                long dt = dataPoint.getDt();

                // 2. Tính toán AQI chuẩn (0-500)
                int calculatedAqi = calculateUsaAqi(components);
                
                String city = getCityNameFromGps(lat, lon);

                // 3. Trả về DTO mới
                return AqiResponse.builder()
                        .calculatedAqiValue(calculatedAqi) // GIÁ TRỊ 0-500
                        .owmAqiValue(owmAqi) // GIÁ TRỊ GỐC 1-5
                        .status(mapAqiToStatus(calculatedAqi)) // Map trạng thái dựa trên 0-500
                        .dominantPollutant(findDominantPollutant(components))
                        .latitude(lat)
                        .longitude(lon)
                        .city(city)
                        .timeObservation(convertUnixTime(dt))
                        .healthAdvisory(getHealthAdvisory(calculatedAqi))
                        .components(components) // TRẢ VỀ CẢ COMPONENTS ĐỂ FRONTEND KIỂM TRA
                        .build();
            }
        } catch (Exception e) {
            System.err.println("Lỗi gọi API AQI: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * [NÂNG CẤP] Tìm tọa độ từ địa chỉ (Có cơ chế thử lại thông minh)
     */
    public GeocodingResponse getCoordinatesFromAddress(String address) {
        // Lần 1: Thử tìm chính xác địa chỉ người dùng nhập
        GeocodingResponse result = callGeocodingApi(address);

        // Lần 2: Nếu thất bại và địa chỉ có chứa dấu phẩy, thử rút gọn
        if (result == null && address.contains(",")) {
            String[] parts = address.split(",", 2); 
            if (parts.length > 1) {
                String simplifiedAddress = parts[1].trim();
                System.out.println("Không tìm thấy địa chỉ chi tiết. Đang thử lại với: " + simplifiedAddress);
                result = callGeocodingApi(simplifiedAddress);
                
                // Lần 3: Nếu vẫn thất bại, thử rút gọn thêm lần nữa (nếu còn dấu phẩy)
                if (result == null && simplifiedAddress.contains(",")) {
                    String[] parts2 = simplifiedAddress.split(",", 2);
                    if (parts2.length > 1) {
                        String evenSimpler = parts2[1].trim();
                        System.out.println("Vẫn không thấy. Thử cấp cao hơn: " + evenSimpler);
                        result = callGeocodingApi(evenSimpler);
                    }
                }
            }
        }
        return result;
    }


    // =======================================================
    // --- CÁC HÀM PRIVATE HELPER (ĐÃ XÓA DUPLICATE) ---
    // =======================================================

    private String mapAqiToStatus(int aqi) {
        if (aqi >= 301) return "Hazardous";
        if (aqi >= 201) return "Very Unhealthy";
        if (aqi >= 151) return "Unhealthy";
        if (aqi >= 101) return "Unhealthy for sensitive groups";
        if (aqi >= 51) return "Moderate";
        if (aqi >= 0) return "Good";
        return "Unknown";
    }

    private String getHealthAdvisory(int aqi) {
        if (aqi >= 301) return "Khuyến cáo: Mọi người nên tránh ra ngoài. Nhóm nhạy cảm cần ở trong nhà.";
        if (aqi >= 201) return "Khuyến cáo: Mọi người nên hạn chế hoạt động ngoài trời. Nhóm nhạy cảm nên tránh ra ngoài.";
        if (aqi >= 151) return "Khuyến cáo: Mọi người nên hạn chế hoạt động ngoài trời kéo dài. Nhóm nhạy cảm nên tránh ra ngoài.";
        if (aqi >= 101) return "Khuyến cáo: Nhóm nhạy cảm (trẻ em, người già, người bệnh) nên hạn chế ra ngoài.";
        if (aqi >= 51) return "Chấp nhận được: Có thể có nguy cơ nhỏ cho nhóm nhạy cảm.";
        if (aqi >= 0) return "Không khí tốt: Thoải mái hoạt động ngoài trời.";
        return "Không có dữ liệu.";
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

            ResponseEntity<GeocodingResponse[]> responseEntity = 
                restTemplate.getForEntity(uri, GeocodingResponse[].class);
            
            GeocodingResponse[] responses = responseEntity.getBody();

            if (responses != null && responses.length > 0) {
                return responses[0];
            }
        } catch (Exception e) {
            System.err.println("Geocoding API error cho địa chỉ '" + address + "': " + e.getMessage());
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
}