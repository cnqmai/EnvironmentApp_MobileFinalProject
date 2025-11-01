package com.enviro.app.environment_backend.dto;

import com.enviro.app.environment_backend.model.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class ReportStatusUpdateRequest {
    
    @NotNull(message = "Trạng thái mới không được để trống")
    ReportStatus newStatus;
}