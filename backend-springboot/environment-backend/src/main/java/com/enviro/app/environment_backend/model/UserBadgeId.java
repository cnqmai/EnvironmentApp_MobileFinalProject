package com.enviro.app.environment_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Composite Primary Key cho bảng user_badges
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBadgeId implements Serializable {
    
    private UUID user;
    private Integer badge;
}

