package com.enviro.app.environment_backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.enviro.app.environment_backend.dto.DeleteAccountRequest;
// --- IMPORT QUAN TRỌNG: Đảm bảo các DTO này tồn tại ---
import com.enviro.app.environment_backend.dto.PrivacySettingsResponse; 
import com.enviro.app.environment_backend.dto.PrivacySettingsRequest;
import com.enviro.app.environment_backend.dto.NotificationSettingsRequest;
import com.enviro.app.environment_backend.dto.NotificationSettingsResponse;
import com.enviro.app.environment_backend.dto.UpdateProfileRequest;
import com.enviro.app.environment_backend.dto.UserStatisticsResponse;
import com.enviro.app.environment_backend.model.NotificationSettings;
import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.ReportStatus;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.NotificationSettingsRepository;
import com.enviro.app.environment_backend.repository.ReportRepository;
import com.enviro.app.environment_backend.repository.SavedLocationRepository;
import com.enviro.app.environment_backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final SavedLocationRepository savedLocationRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;

    public UserService(UserRepository userRepository, 
                      ReportRepository reportRepository,
                      SavedLocationRepository savedLocationRepository,
                      NotificationSettingsRepository notificationSettingsRepository) {
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.savedLocationRepository = savedLocationRepository;
        this.notificationSettingsRepository = notificationSettingsRepository;
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

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getDefaultLocation() != null) user.setDefaultLocation(request.getDefaultLocation());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        
        if (request.getDateOfBirth() != null) {
            try {
                 // Sửa lỗi: Nếu request.getDateOfBirth() là LocalDate thì dùng trực tiếp, nếu String thì parse
                 // Ở đây giả định request trả về object có thể toString được
                 user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth().toString())); 
            } catch (Exception e) {
                System.err.println("Error updating DOB: " + e.getMessage());
            }
        }
        return userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        userRepository.delete(user);
    }

    @Transactional
    public void deleteUserAccount(UUID userId, DeleteAccountRequest request) {
        deleteUser(userId);
    }

    public String uploadAvatar(MultipartFile file, UUID userId) {
        // Logic upload giả lập
        return "https://api.example.com/uploads/avatars/" + userId + "/" + file.getOriginalFilename();
    }

    // --- FIX LỖI: Đổi kiểu trả về từ Object sang PrivacySettingsResponse ---
    public PrivacySettingsResponse getPrivacySettings(UUID userId) {
        // TODO: Lấy settings từ DB thật. Hiện tại trả về null để code biên dịch được.
        // Bạn cần đảm bảo class PrivacySettingsResponse đã được tạo trong package dto
        return null; 
    }

    public PrivacySettingsResponse updatePrivacySettings(UUID userId, PrivacySettingsRequest request) {
        // TODO: Lưu settings vào DB
        return null;
    }
    
    public UserStatisticsResponse getUserStatistics(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        
        long totalReports = reportRepository.countByUser(user);
        long reportsReceived = reportRepository.countByUserAndStatus(user, ReportStatus.RECEIVED);
        long reportsProcessing = reportRepository.countByUserAndStatus(user, ReportStatus.IN_PROGRESS);
        long reportsCompleted = reportRepository.countByUserAndStatus(user, ReportStatus.RESOLVED);
        long savedLocationsCount = savedLocationRepository.countByUserId(userId);
        
        List<Report> userReports = reportRepository.findByUserOrderByCreatedAtDesc(user);
        long wasteClassificationsCount = userReports.stream().filter(r -> r.getWasteCategory() != null).count();
        long totalMediaUploaded = userReports.stream().mapToLong(r -> r.getReportMedia() != null ? r.getReportMedia().size() : 0).sum();
        
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

    public NotificationSettingsResponse getNotificationSettings(UUID userId) {
        NotificationSettings settings = notificationSettingsRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy cài đặt"));
        
        return NotificationSettingsResponse.builder()
            .aqiAlertEnabled(settings.getAqiAlertEnabled())
            .aqiThreshold(settings.getAqiThreshold())
            .collectionReminderEnabled(settings.getCollectionReminderEnabled())
            .campaignNotificationsEnabled(settings.getCampaignNotificationsEnabled())
            .weatherAlertEnabled(settings.getWeatherAlertEnabled())
            .badgeNotificationsEnabled(settings.getBadgeNotificationsEnabled())
            .reportStatusNotificationsEnabled(settings.getReportStatusNotificationsEnabled())
            .build();
    }

    @Transactional
    public NotificationSettingsResponse updateNotificationSettings(UUID userId, NotificationSettingsRequest request) {
        NotificationSettings settings = notificationSettingsRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy cài đặt"));
        
        if (request.getAqiAlertEnabled() != null) settings.setAqiAlertEnabled(request.getAqiAlertEnabled());
        if (request.getAqiThreshold() != null) settings.setAqiThreshold(request.getAqiThreshold());
        if (request.getCollectionReminderEnabled() != null) settings.setCollectionReminderEnabled(request.getCollectionReminderEnabled());
        if (request.getCampaignNotificationsEnabled() != null) settings.setCampaignNotificationsEnabled(request.getCampaignNotificationsEnabled());
        if (request.getWeatherAlertEnabled() != null) settings.setWeatherAlertEnabled(request.getWeatherAlertEnabled());
        if (request.getBadgeNotificationsEnabled() != null) settings.setBadgeNotificationsEnabled(request.getBadgeNotificationsEnabled());
        if (request.getReportStatusNotificationsEnabled() != null) settings.setReportStatusNotificationsEnabled(request.getReportStatusNotificationsEnabled());
        
        NotificationSettings updatedSettings = notificationSettingsRepository.save(settings);
        
        return NotificationSettingsResponse.builder()
            .aqiAlertEnabled(updatedSettings.getAqiAlertEnabled())
            .aqiThreshold(updatedSettings.getAqiThreshold())
            .collectionReminderEnabled(updatedSettings.getCollectionReminderEnabled())
            .campaignNotificationsEnabled(updatedSettings.getCampaignNotificationsEnabled())
            .weatherAlertEnabled(updatedSettings.getWeatherAlertEnabled())
            .badgeNotificationsEnabled(updatedSettings.getBadgeNotificationsEnabled())
            .reportStatusNotificationsEnabled(updatedSettings.getReportStatusNotificationsEnabled())
            .build();
    }
}