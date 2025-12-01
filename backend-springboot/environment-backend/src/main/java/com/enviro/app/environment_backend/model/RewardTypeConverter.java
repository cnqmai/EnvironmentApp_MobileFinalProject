// File: RewardTypeConverter.java (Bạn cần tạo file này)
package com.enviro.app.environment_backend.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.stream.Stream;

@Converter(autoApply = true)
public class RewardTypeConverter implements AttributeConverter<RewardType, String> {

    @Override
    public String convertToDatabaseColumn(RewardType attribute) {
        if (attribute == null) {
            return null;
        }
        // Chuyển đổi sang chữ thường cho PostgreSQL
        return attribute.name().toLowerCase();
    }

    @Override
    public RewardType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        
        // Chuyển đổi chuỗi DB (chữ thường) thành Enum Java (chữ hoa)
        return Stream.of(RewardType.values())
            .filter(t -> t.name().equals(dbData.toUpperCase()))
            .findFirst()
            .orElseThrow(IllegalArgumentException::new);
    }
}