package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.UpdateProfileRequest;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest request) {
        User currentUser = getCurrentUser();
        User updatedUser = userService.updateUserProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }
}