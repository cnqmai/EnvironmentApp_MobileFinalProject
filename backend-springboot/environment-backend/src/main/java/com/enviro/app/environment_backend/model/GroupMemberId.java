package com.enviro.app.environment_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Composite Primary Key cho bảng group_members
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberId implements Serializable {
    
    private UUID user;
    private UUID group;
}

