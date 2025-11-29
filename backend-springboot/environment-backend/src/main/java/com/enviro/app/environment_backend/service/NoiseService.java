package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.NoiseResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class NoiseService {
    
    // Hàm giả lập (MOCK) để thay thế cho việc gọi API tiếng ồn thực tế
    public NoiseResponse getCurrentNoiseByGps(double lat, double lon) {
        // --- GIẢ LẬP DỮ LIỆU TẠI ĐÂY ---
        int mockDecibel = (int) (60 + Math.random() * 25); // 60 dBA - 85 dBA
        String status = mapDecibelToStatus(mockDecibel);
        String advisory = getNoiseAdvisory(mockDecibel);
        
        // Giả lập lấy tên thành phố (thực tế nên dùng Geocoding như trong AqiService)
        String city = "Hồ Chí Minh"; 
        
        return NoiseResponse.builder()
                .decibel(mockDecibel)
                .status(status)
                .healthAdvisory(advisory)
                .city(city)
                .latitude(lat)
                .longitude(lon)
                .timeObservation(convertCurrentTime())
                .build();
    }

    private String mapDecibelToStatus(int decibel) {
        if (decibel >= 80) return "Ô nhiễm";
        if (decibel >= 70) return "Gây khó chịu";
        return "Bình thường";
    }

    private String getNoiseAdvisory(int decibel) {
        if (decibel >= 80) return "Cảnh báo: Tiếng ồn có thể gây ảnh hưởng thính giác nếu tiếp xúc lâu dài.";
        if (decibel >= 70) return "Khuyến cáo: Hạn chế tiếp xúc tiếng ồn lớn, đặc biệt vào ban đêm.";
        return "Không gian yên tĩnh, an toàn cho hoạt động thường ngày.";
    }
    
    private String convertCurrentTime() {
        return Instant.now()
            .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}