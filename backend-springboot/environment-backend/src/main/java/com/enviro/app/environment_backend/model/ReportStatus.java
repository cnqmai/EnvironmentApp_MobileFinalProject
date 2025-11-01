package com.enviro.app.environment_backend.model;

/**
 * Định nghĩa các trạng thái của Báo cáo (Report).
 */
public enum ReportStatus {
    RECEIVED,    // 1. Tiếp nhận (Khi người dùng gửi lên)
    IN_PROGRESS, // 2. Đang xử lý
    RESOLVED,    // 3. Hoàn thành (Đã xử lý xong)
    REJECTED     // 4. Từ chối (Không hợp lệ)
}