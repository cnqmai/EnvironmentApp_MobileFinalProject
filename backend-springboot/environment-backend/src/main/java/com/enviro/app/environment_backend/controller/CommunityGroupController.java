package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.CommunityGroupResponse;
import com.enviro.app.environment_backend.dto.CreateGroupRequest;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.CommunityGroupService;
import com.enviro.app.environment_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
public class CommunityGroupController {

    private final CommunityGroupService groupService;
    private final UserService userService;

    public CommunityGroupController(CommunityGroupService groupService, UserService userService) {
        this.groupService = groupService;
        this.userService = userService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    @GetMapping
    public ResponseEntity<List<CommunityGroupResponse>> getAllGroups() {
        User user = getCurrentUser();
        return ResponseEntity.ok(groupService.getAllGroups(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityGroupResponse> getGroupById(@PathVariable UUID id) {
        User user = getCurrentUser();
        return ResponseEntity.ok(groupService.getGroupById(id, user));
    }

    @PostMapping
    public ResponseEntity<CommunityGroupResponse> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        User user = getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.createGroup(user, request));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<CommunityGroupResponse> joinGroup(@PathVariable UUID id) {
        User user = getCurrentUser();
        return ResponseEntity.ok(groupService.joinGroup(id, user));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Map<String, String>> leaveGroup(@PathVariable UUID id) {
        User user = getCurrentUser();
        groupService.leaveGroup(id, user);
        return ResponseEntity.ok(Map.of("message", "Đã rời khỏi nhóm thành công"));
    }
}

