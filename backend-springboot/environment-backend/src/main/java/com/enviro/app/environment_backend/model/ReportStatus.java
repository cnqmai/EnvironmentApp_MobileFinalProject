package com.enviro.app.environment_backend.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.stream.Stream;

/**
 * Định nghĩa các trạng thái của Báo cáo (Report).
 */
public enum ReportStatus {
    RECEIVED("received"),       // 1. Tiếp nhận
    IN_PROGRESS("processing"),  // 2. Đang xử lý (Lưu ý: DB bạn là 'processing', Java là IN_PROGRESS)
    RESOLVED("completed"),      // 3. Hoàn thành (DB là 'completed')
    REJECTED("rejected");       // 4. Từ chối

    private final String dbValue;

    ReportStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    // Khi trả về JSON hoặc lưu DB, dùng giá trị chữ thường này
    @JsonValue
    public String getDbValue() {
        return dbValue;
    }

    // Khi nhận JSON từ Frontend, convert string thành Enum
    @JsonCreator
    public static ReportStatus fromValue(String value) {
        if (value == null) return null;
        return Stream.of(ReportStatus.values())
                .filter(s -> s.dbValue.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown status: " + value));
    }

    // --- Converter để JPA tự động chuyển đổi khi lưu xuống PostgreSQL ---
    @Converter(autoApply = true)
    public static class ReportStatusConverter implements AttributeConverter<ReportStatus, String> {
        @Override
        public String convertToDatabaseColumn(ReportStatus status) {
            if (status == null) return null;
            return status.getDbValue(); // Lưu 'received' thay vì 'RECEIVED'
        }

        @Override
        public ReportStatus convertToEntityAttribute(String dbData) {
            if (dbData == null) return null;
            return ReportStatus.fromValue(dbData); // Đọc 'received' thành Enum RECEIVED
        }
    }
}