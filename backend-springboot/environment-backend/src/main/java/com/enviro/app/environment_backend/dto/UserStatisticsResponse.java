package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

/**
 * DTO trả về thống kê cá nhân của người dùng (FR-13.1.1)
 */
@Value
@Builder
public class UserStatisticsResponse {
    
    // Tổng số báo cáo đã gửi
    long totalReports;
    
    // Số báo cáo theo trạng thái
    long reportsReceived;    // Đã nhận
    long reportsProcessing;  // Đang xử lý
    long reportsCompleted;   // Hoàn thành
    
    // Điểm thưởng hiện tại
    int currentPoints;
    
    // Số vị trí đã lưu
    long savedLocationsCount;
    
    // Số lượt phân loại rác (có thể tính từ reports có categoryId)
    long wasteClassificationsCount;
    
    // Tổng số media (ảnh/video) đã upload
    long totalMediaUploaded;
}

