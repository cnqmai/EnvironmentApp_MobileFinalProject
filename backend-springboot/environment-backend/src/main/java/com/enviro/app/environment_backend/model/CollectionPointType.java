package com.enviro.app.environment_backend.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.stream.Stream;

/**
 * Enum định nghĩa các loại điểm thu gom.
 * Sử dụng Converter để xử lý sự khác biệt hoa/thường giữa Java và PostgreSQL.
 */
public enum CollectionPointType {
    PLASTIC("plastic"), 
    ELECTRONIC("electronic"),
    ORGANIC("organic"),
    METAL("metal"),
    GLASS("glass"),
    PAPER("paper"),
    HAZARDOUS("hazardous"),
    MEDICAL("medical"),
    CONSTRUCTION("construction"), 
    OTHER("other");

    private final String dbValue;

    CollectionPointType(String dbValue) {
        this.dbValue = dbValue;
    }
    
    // Phương thức tĩnh để tìm kiếm từ giá trị DB (chữ thường)
    public static CollectionPointType fromDbValue(String dbValue) {
        if (dbValue == null) return null;
        return Stream.of(CollectionPointType.values())
                .filter(c -> c.dbValue.equalsIgnoreCase(dbValue))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid CollectionPointType DB value: " + dbValue));
    }

    // --- CONVERTER: CHUYỂN ĐỔI NGAY LÚC LƯU/ĐỌC DB ---
    @Converter(autoApply = true)
    public static class CollectionPointTypeConverter implements AttributeConverter<CollectionPointType, String> {
        
        @Override // Khi lưu vào DB (Java ENUM -> String DB)
        public String convertToDatabaseColumn(CollectionPointType type) {
            return type == null ? null : type.dbValue; // Lưu 'electronic'
        }

        @Override // Khi đọc từ DB (String DB -> Java ENUM)
        public CollectionPointType convertToEntityAttribute(String dbData) {
            return dbData == null ? null : CollectionPointType.fromDbValue(dbData); // Đọc 'electronic' -> ELECTRONIC
        }
    }
}