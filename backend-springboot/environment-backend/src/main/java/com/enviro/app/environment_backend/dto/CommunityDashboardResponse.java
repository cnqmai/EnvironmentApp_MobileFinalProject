package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

/**
 * DTO trả về thống kê cộng đồng (FR-12.1.2)
 */
@Value
@Builder
public class CommunityDashboardResponse {
    
    // Tổng số báo cáo vi phạm của tất cả người dùng
    long totalViolationReports;
    
    // Lượng rác tái chế được (tổng số post có chứa "tái chế")
    long recycledWasteCount;
}

