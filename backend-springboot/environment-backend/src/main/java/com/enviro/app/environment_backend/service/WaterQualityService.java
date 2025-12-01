package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.WaterQualityResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class WaterQualityService {
    
    // Hàm giả lập (MOCK) để thay thế cho việc gọi API chất lượng nước thực tế
    public WaterQualityResponse getCurrentWaterQualityByGps(double lat, double lon) {
        // --- GIẢ LẬP DỮ LIỆU TẠI ĐÂY ---
        double mockPh = 6.5 + Math.random() * 2; // 6.5 - 8.5
        double mockDo = 4.0 + Math.random() * 3; // 4.0 - 7.0 mg/L

        String status = mapWaterIndexToStatus(mockPh);
        String advisory = getWaterAdvisory(status);
        
        String city = "Hồ Chí Minh"; 

        return WaterQualityResponse.builder()
                .parameters(Map.of("pH", mockPh, "DO", mockDo))
                .mainIndexValue(mockPh) // Lấy pH làm chỉ số chính
                .status(status)
                .healthAdvisory(advisory)
                .city(city)
                .latitude(lat)
                .longitude(lon)
                .timeObservation(convertCurrentTime())
                .build();
    }

    private String mapWaterIndexToStatus(double ph) {
        if (ph < 6.0 || ph > 9.0) return "Ô nhiễm nặng (pH)";
        if (ph < 6.5 || ph > 8.5) return "Không đạt chuẩn";
        return "Đạt chuẩn";
    }

    private String getWaterAdvisory(String status) {
        if (status.contains("Ô nhiễm nặng")) return "Cảnh báo: Không sử dụng nước cho sinh hoạt, cần xử lý ngay lập tức.";
        if (status.contains("Không đạt chuẩn")) return "Khuyến cáo: Cần kiểm tra và xử lý trước khi sử dụng.";
        return "Chất lượng nước chấp nhận được.";
    }

    private String convertCurrentTime() {
        return Instant.now()
            .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}