package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Value;

/**
 * DTO chứa thông tin yêu cầu lấy AQI từ client.
 * Được sử dụng nếu bạn muốn gói gọn các tham số trong Body request (JSON).
 */
@Value // Dùng @Value để tạo lớp bất biến (immutable)
public class AqiRequest {

    // Thêm validation cơ bản cho tọa độ
    @Min(value = -90, message = "Vĩ độ phải lớn hơn hoặc bằng -90")
    @Max(value = 90, message = "Vĩ độ phải nhỏ hơn hoặc bằng 90")
    double latitude;

    @Min(value = -180, message = "Kinh độ phải lớn hơn hoặc bằng -180")
    @Max(value = 180, message = "Kinh độ phải nhỏ hơn hoặc bằng 180")
    double longitude;
    
    // String unit; // Ví dụ: Đơn vị AQI (US AQI hay Chinese AQI)
}