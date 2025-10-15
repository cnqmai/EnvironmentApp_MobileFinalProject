package com.enviro.app.environment_backend.service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.enviro.app.environment_backend.dto.UpdateProfileRequest;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        // Cập nhật các trường hiện có
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getDefaultLocation() != null) {
            user.setDefaultLocation(request.getDefaultLocation());
        }

        // --- THÊM MỚI: Cập nhật các trường mới ---
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDateOfBirth() != null) {
            try {
                // Chuyển đổi String "yyyy-MM-dd" thành đối tượng LocalDate
                user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            } catch (DateTimeParseException e) {
                // Có thể bỏ qua hoặc log lỗi nếu định dạng ngày tháng không đúng
                System.err.println("Invalid date format for dateOfBirth: " + request.getDateOfBirth());
            }
        }
        // ------------------------------------

        return userRepository.save(user);
    }
}