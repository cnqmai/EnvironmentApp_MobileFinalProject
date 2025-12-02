package com.enviro.app.environment_backend.dto;

import com.enviro.app.environment_backend.model.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body cho API cập nhật trạng thái báo cáo.
 * Cần có constructor rỗng để Jackson có thể deserialize.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportStatusUpdateRequest {

    @NotNull(message = "Trạng thái mới không được để trống")
    private ReportStatus newStatus;
}