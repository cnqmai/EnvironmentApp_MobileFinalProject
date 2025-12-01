package com.enviro.app.environment_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class CommunityGroupResponse {
    UUID id;
    String name;
    String description;
    String areaType;
    String areaName; // [MỚI] Khu vực hoạt động
    UUID creatorId;
    String creatorName;
    Boolean isPublic;
    Integer memberCount;
    Boolean isMember; // User hiện tại có là thành viên không
    String role; // Role của user trong group (nếu là member)
    OffsetDateTime createdAt;
    
    // --- FR-12.1.2: Dữ liệu Dashboard ---
    @Builder.Default
    Integer totalReports = 0; // [MỚI] Tổng số báo cáo vi phạm
    @Builder.Default
    Double recycledWasteKg = 0.0; // [MỚI] Lượng rác tái chế (kg)
    // ------------------------------------
    
    String imageUrl; // [MỚI] Ảnh đại diện nhóm (Cần thêm vào Model nếu sử dụng thực tế)
}