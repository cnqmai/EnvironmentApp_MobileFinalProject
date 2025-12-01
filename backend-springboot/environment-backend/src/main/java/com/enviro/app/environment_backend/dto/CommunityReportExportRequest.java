package com.enviro.app.environment_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO nhận dữ liệu từ Frontend để xuất báo cáo cộng đồng (FR-12.1.3)
 */
@Value
public class CommunityReportExportRequest {

    @NotBlank(message = "Tên cộng đồng không được để trống")
    String communityName;
    
    @NotBlank(message = "ID nhóm không được để trống")
    String groupId; // Nhận dưới dạng String từ JS, có thể chuyển đổi thành UUID/Long sau
    
    @NotNull(message = "Dữ liệu thống kê không được để trống")
    CommunityStats stats;
    
    @NotNull(message = "Chi tiết báo cáo không được để trống")
    List<ReportDetail> reportsDetail;
    
    @NotBlank(message = "Thông tin người xuất không được để trống")
    String exportedBy;
    
    @NotNull(message = "Ngày xuất không được để trống")
    OffsetDateTime exportedDate; // Giả định nhận ISO string và Spring boot tự chuyển đổi

    @Value
    public static class CommunityStats {
        @NotNull Long memberCount;
        @NotNull Long totalReports;
        @NotNull Double recycledWasteKg;
        @NotNull Integer mockCampaigns;
    }

    @Value
    public static class ReportDetail {
        @NotNull Long id;
        @NotBlank String description;
        @NotBlank String status;
        @NotNull OffsetDateTime date;
    }
}