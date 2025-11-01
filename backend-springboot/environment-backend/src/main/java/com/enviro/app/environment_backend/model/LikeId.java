package com.enviro.app.environment_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Composite Primary Key cho bảng likes
 * Dùng với @IdClass
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LikeId implements Serializable {
    
    private UUID user;
    private UUID post;
}

