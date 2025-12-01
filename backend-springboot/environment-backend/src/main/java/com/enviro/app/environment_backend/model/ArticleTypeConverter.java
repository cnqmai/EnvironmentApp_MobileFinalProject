package com.enviro.app.environment_backend.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.stream.Stream;

/**
 * Converter tùy chỉnh để chuyển đổi giữa ArticleType Enum và String chữ thường 
 * trong cơ sở dữ liệu (cần thiết cho PostgreSQL ENUM không phân biệt chữ hoa/thường).
 */
@Converter(autoApply = true) // Tự động áp dụng cho tất cả các trường ArticleType
public class ArticleTypeConverter implements AttributeConverter<ArticleType, String> {

    // Chuyển đổi từ Java Enum sang Database String
    @Override
    public String convertToDatabaseColumn(ArticleType attribute) {
        if (attribute == null) {
            return null;
        }
        // LỖI XẢY RA: DB chỉ chấp nhận chữ thường (ví dụ: "video")
        // Khắc phục bằng cách chuyển đổi Enum name sang chữ thường
        return attribute.name().toLowerCase();
    }

    // Chuyển đổi từ Database String sang Java Enum
    @Override
    public ArticleType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        
        // Chuyển đổi chuỗi DB (chữ thường) thành Enum Java (chữ hoa)
        return Stream.of(ArticleType.values())
            .filter(t -> t.name().equals(dbData.toUpperCase()))
            .findFirst()
            .orElseThrow(IllegalArgumentException::new);
    }
}