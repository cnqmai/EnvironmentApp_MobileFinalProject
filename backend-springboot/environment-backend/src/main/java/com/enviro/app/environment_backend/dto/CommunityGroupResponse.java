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
    String areaName;
    UUID creatorId;
    String creatorName;
    Boolean isPublic;
    Integer memberCount;
    Boolean isMember; // User hiện tại có là thành viên không
    String role; // Role của user trong group (nếu là member)
    OffsetDateTime createdAt;
}

