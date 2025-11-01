package com.enviro.app.environment_backend.model;

/**
 * Enum định nghĩa các loại điểm thu gom rác (FR-10.1.2)
 */
public enum CollectionPointType {
    PLASTIC,      // Rác thải nhựa
    ELECTRONIC,   // Rác thải điện tử
    ORGANIC,      // Rác thải hữu cơ
    METAL,        // Rác thải kim loại
    GLASS,        // Rác thải thủy tinh
    PAPER,        // Rác thải giấy
    HAZARDOUS,    // Rác thải nguy hại
    MEDICAL,      // Rác thải y tế
    OTHER         // Rác thải khác
}

