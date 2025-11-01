package com.enviro.app.environment_backend.service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.enviro.app.environment_backend.dto.UpdateProfileRequest;
import com.enviro.app.environment_backend.dto.UserStatisticsResponse;
import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.ReportStatus;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.ReportRepository;
import com.enviro.app.environment_backend.repository.SavedLocationRepository;
import com.enviro.app.environment_backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final SavedLocationRepository savedLocationRepository;

    public UserService(UserRepository userRepository, 
                      ReportRepository reportRepository,
                      SavedLocationRepository savedLocationRepository) {
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.savedLocationRepository = savedLocationRepository;
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
    
    /**
     * Xóa tài khoản và toàn bộ dữ liệu liên quan (FR-7.2)
     * Cascade delete sẽ tự động xóa các bảng liên quan (reports, saved_locations, etc.)
     */
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        
        // Xóa user (cascade delete sẽ tự động xóa các bảng liên quan do ON DELETE CASCADE)
        userRepository.delete(user);
    }
    
    /**
     * Lấy thống kê cá nhân của user (FR-13.1.1)
     */
    public UserStatisticsResponse getUserStatistics(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        
        // Đếm tổng số báo cáo
        long totalReports = reportRepository.countByUser(user);
        
        // Đếm số báo cáo theo trạng thái (tối ưu hơn - query trực tiếp)
        long reportsReceived = reportRepository.countByUserAndStatus(user, ReportStatus.RECEIVED);
        long reportsProcessing = reportRepository.countByUserAndStatus(user, ReportStatus.IN_PROGRESS);
        long reportsCompleted = reportRepository.countByUserAndStatus(user, ReportStatus.RESOLVED);
        
        // Đếm số vị trí đã lưu
        long savedLocationsCount = savedLocationRepository.countByUserId(userId);
        
        // Đếm số lần phân loại rác và tổng số media (lấy danh sách reports một lần)
        List<Report> userReports = reportRepository.findByUserOrderByCreatedAtDesc(user);
        long wasteClassificationsCount = userReports.stream()
                .filter(r -> r.getWasteCategory() != null)
                .count();
        
        // Đếm tổng số media đã upload
        long totalMediaUploaded = userReports.stream()
                .mapToLong(r -> r.getReportMedia() != null ? r.getReportMedia().size() : 0)
                .sum();
        
        return UserStatisticsResponse.builder()
                .totalReports(totalReports)
                .reportsReceived(reportsReceived)
                .reportsProcessing(reportsProcessing)
                .reportsCompleted(reportsCompleted)
                .currentPoints(user.getPoints())
                .savedLocationsCount(savedLocationsCount)
                .wasteClassificationsCount(wasteClassificationsCount)
                .totalMediaUploaded(totalMediaUploaded)
                .build();
    }
}