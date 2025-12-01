package com.enviro.app.environment_backend.service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.nio.file.Files; 
import java.nio.file.Path; 
import java.nio.file.Paths; 
import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Value;

import com.enviro.app.environment_backend.dto.DeleteAccountRequest;
import com.enviro.app.environment_backend.dto.NotificationSettingsRequest;
import com.enviro.app.environment_backend.dto.NotificationSettingsResponse;
import com.enviro.app.environment_backend.dto.PrivacySettingsRequest;
import com.enviro.app.environment_backend.dto.PrivacySettingsResponse;
import com.enviro.app.environment_backend.dto.UpdateProfileRequest;
import com.enviro.app.environment_backend.dto.CommunityDashboardResponse;
import com.enviro.app.environment_backend.dto.UserStatisticsResponse;
import com.enviro.app.environment_backend.model.NotificationSettings;
import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.ReportStatus;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.ChatbotHistoryRepository;
import com.enviro.app.environment_backend.repository.NotificationSettingsRepository;
import com.enviro.app.environment_backend.repository.PostRepository;
import com.enviro.app.environment_backend.repository.ReportRepository;
import com.enviro.app.environment_backend.repository.SavedLocationRepository;
import com.enviro.app.environment_backend.repository.UserBadgeRepository;
import com.enviro.app.environment_backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final SavedLocationRepository savedLocationRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ChatbotHistoryRepository chatbotHistoryRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    // Đường dẫn upload (được inject từ application.properties)
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // CẬP NHẬT: Hàm khởi tạo (Constructor)
    public UserService(UserRepository userRepository, 
                  ReportRepository reportRepository,
                  SavedLocationRepository savedLocationRepository,
                  NotificationSettingsRepository notificationSettingsRepository,
                  UserBadgeRepository userBadgeRepository, 
                  ChatbotHistoryRepository chatbotHistoryRepository,
                  PostRepository postRepository,
                  PasswordEncoder passwordEncoder,
                  NotificationService notificationService) { 
    this.userRepository = userRepository;
    this.reportRepository = reportRepository;
    this.savedLocationRepository = savedLocationRepository;
    this.notificationSettingsRepository = notificationSettingsRepository;
    this.userBadgeRepository = userBadgeRepository;
    this.chatbotHistoryRepository = chatbotHistoryRepository;
    this.postRepository = postRepository;
    this.passwordEncoder = passwordEncoder;
    this.notificationService = notificationService;
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

    public String uploadAvatar(MultipartFile file, UUID userId) {
        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File không được rỗng.");
        }
        
        // 1. Lấy đuôi file và tạo tên file mới (avatar_userId.jpg)
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename.contains(".")) {
             extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = "avatar_" + userId.toString() + extension;
        
        try {
            // 2. Định nghĩa đường dẫn lưu trữ
            // Lưu ý: Cần đảm bảo thư mục này tồn tại hoặc có quyền ghi
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // 3. Lưu file vào ổ đĩa
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            // 4. Trả về URL (Giả định bạn đã cấu hình Static Resource Handler để map /uploads/** tới thư mục này)
            // Ví dụ URL trả về: http://IP_MAY:8080/uploads/avatar_....jpg
            // Ở đây trả về đường dẫn tương đối để Frontend ghép với Base URL
            String publicUrl = "/uploads/" + fileName; 
            
            System.out.println(">>> [UPLOAD] Saved file to: " + filePath.toString());
            
            return publicUrl;
        } catch (IOException e) {
            System.err.println("Error saving file: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi server khi lưu file ảnh.");
        }
    }

    @Transactional
    public User updateUserProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getDefaultLocation() != null) {
            user.setDefaultLocation(request.getDefaultLocation());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDateOfBirth() != null) {
            try {
                user.setDateOfBirth(request.getDateOfBirth());
            } catch (DateTimeParseException e) {
                System.err.println("Invalid date format for dateOfBirth: " + request.getDateOfBirth());
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
    
    public UserStatisticsResponse getUserStatistics(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        
        long totalReports = reportRepository.countByUser(user);
        long reportsReceived = reportRepository.countByUserAndStatus(user, ReportStatus.RECEIVED);
        long reportsProcessing = reportRepository.countByUserAndStatus(user, ReportStatus.IN_PROGRESS);
        long reportsCompleted = reportRepository.countByUserAndStatus(user, ReportStatus.RESOLVED);
        long savedLocationsCount = savedLocationRepository.countByUserId(userId);
        
        List<Report> userReports = reportRepository.findByUserOrderByCreatedAtDesc(user);
        
        // FR-12.1.1: Số lần phân loại rác = số lần dùng recycle search/camera (đã được log)
        long wasteClassificationsCount = user.getClassificationCount();
        
        long totalMediaUploaded = userReports.stream()
                .mapToLong(r -> r.getReportMedia() != null ? r.getReportMedia().size() : 0)
                .sum();
        
        // --- ĐẾM SỐ TIN NHẮN CHATBOT ---
        long totalChatMessages = chatbotHistoryRepository.countByUser(user);
        // -------------------------------

        return UserStatisticsResponse.builder()
                .totalReports(totalReports)
                .reportsReceived(reportsReceived)
                .reportsProcessing(reportsProcessing)
                .reportsCompleted(reportsCompleted)
                .currentPoints(user.getPoints())
                .savedLocationsCount(savedLocationsCount)
                .wasteClassificationsCount(wasteClassificationsCount)
                .totalMediaUploaded(totalMediaUploaded)
                .totalChatMessages(totalChatMessages)
                .build();
    }

    // ====================================================================
    // FR-2.2.2: LẤY/CẬP NHẬT CÀI ĐẶT THÔNG BÁO (CHỈ CHỈNH NGƯỠNG)
    // ====================================================================

    public NotificationSettingsResponse getNotificationSettings(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        NotificationSettings settings = notificationService.getOrCreateSettings(user);
        
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        
        NotificationSettings settings = notificationService.getOrCreateSettings(user);
        
        // --- LOGIC CẬP NHẬT: CHỈ CẬP NHẬT NHỮNG GÌ REQUEST GỬI LÊN ---
        
        // 1. Cập nhật Ngưỡng AQI
        if (request.getAqiThreshold() != null) {
            settings.setAqiThreshold(request.getAqiThreshold());
        }
        
        // 2. Cập nhật các cờ Boolean (CHỈ NẾU CÓ DỮ LIỆU)
        if (request.getAqiAlertEnabled() != null) {
            settings.setAqiAlertEnabled(request.getAqiAlertEnabled());
        }
        if (request.getCollectionReminderEnabled() != null) {
            settings.setCollectionReminderEnabled(request.getCollectionReminderEnabled());
        }
        if (request.getCampaignNotificationsEnabled() != null) {
            settings.setCampaignNotificationsEnabled(request.getCampaignNotificationsEnabled());
        }
        if (request.getWeatherAlertEnabled() != null) {
            settings.setWeatherAlertEnabled(request.getWeatherAlertEnabled());
        }
        if (request.getBadgeNotificationsEnabled() != null) {
            settings.setBadgeNotificationsEnabled(request.getBadgeNotificationsEnabled());
        }
        if (request.getReportStatusNotificationsEnabled() != null) {
            settings.setReportStatusNotificationsEnabled(request.getReportStatusNotificationsEnabled());
        }
        
        // --- ĐÃ LOẠI BỎ: CÁC DÒNG TỰ ĐỘNG SET TRUE ---
        
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

    /**
     * Lấy cài đặt Quyền riêng tư của người dùng.
     */
    public PrivacySettingsResponse getPrivacySettings(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        // Giả định bạn đã tạo PrivacySettingsResponse DTO
        return PrivacySettingsResponse.builder()
                .userId(user.getId())
                .sharePersonalData(user.isSharePersonalData()) // Giả sử Lombok tạo isSharePersonalData()
                .shareLocation(user.isShareLocation())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Cập nhật cài đặt Quyền riêng tư.
     */
    @Transactional
    public PrivacySettingsResponse updatePrivacySettings(UUID userId, PrivacySettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (request.getSharePersonalData() != null) {
            user.setSharePersonalData(request.getSharePersonalData());
        }
        if (request.getShareLocation() != null) {
            user.setShareLocation(request.getShareLocation());
        }

        User updatedUser = userRepository.save(user);

        return PrivacySettingsResponse.builder()
                .userId(updatedUser.getId())
                .sharePersonalData(updatedUser.isSharePersonalData())
                .shareLocation(updatedUser.isShareLocation())
                .updatedAt(updatedUser.getUpdatedAt())
                .build();
    }
    
    /**
     * Xóa tài khoản và tất cả dữ liệu liên quan.
     */
    @Transactional
    public void deleteUserAccount(UUID userId, DeleteAccountRequest request) { 
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        
        // 1. Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mật khẩu không chính xác.");
        }
        
        // 2. Kiểm tra chuỗi xác nhận (từ delete-account.jsx)
        if (!"xoataikhoan".equals(request.getConfirmationText())) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chuỗi xác nhận không đúng.");
        }
        
        // 3. Xóa dữ liệu liên quan: QUAN TRỌNG!
        // Xóa các bản ghi liên quan đến user trước (CASCADE DELETE)
        
        // * Giả định các Repository có phương thức deleteBy... (Nếu không, phải dùng Query trong Repository)
        reportRepository.deleteByUser(user);
        savedLocationRepository.deleteByUserId(userId);
        notificationSettingsRepository.deleteByUser(user);
        userBadgeRepository.deleteByUser(user);
        chatbotHistoryRepository.deleteByUser(user);
        
        // 4. Xóa bản ghi User cuối cùng
        userRepository.delete(user);
    }

    // --- PHƯƠNG THỨC MỚI ĐỂ SỬA LỖI ---
    /**
     * Lấy User hiện tại đang đăng nhập từ Security Context.
     * [SECURITY] Đảm bảo mỗi request chỉ lấy đúng user từ JWT token của request đó.
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            System.out.println(">>> [SECURITY] getCurrentUser: No authentication found");
            return null;
        }
        String email = authentication.getName();
        
        // [SECURITY] Validate email không được null hoặc rỗng
        if (email == null || email.trim().isEmpty()) {
            System.out.println(">>> [SECURITY] getCurrentUser: Email is null or empty");
            return null;
        }
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        // [DEBUG] Log để kiểm tra user được lấy
        if (user != null) {
            System.out.println(">>> [SECURITY] getCurrentUser: Found user - ID: " + user.getId() + ", Email: " + user.getEmail());
        } else {
            System.out.println(">>> [SECURITY] getCurrentUser: User not found for email: " + email);
        }
        
        return user;
    }
    
    /**
     * FR-12.1.2: Lấy thống kê dashboard cộng đồng
     * - Tổng số báo cáo vi phạm của tất cả người dùng
     * - Lượng rác tái chế được (tổng số post có chứa "tái chế")
     */
    public CommunityDashboardResponse getCommunityDashboard() {
        // Tổng số báo cáo vi phạm của tất cả người dùng
        long totalViolationReports = reportRepository.count();
        
        // Lượng rác tái chế được: đếm posts có chứa "tái chế" trong nội dung
        long recycledWasteCount = postRepository.countByContentContaining("tái chế");
        
        return CommunityDashboardResponse.builder()
                .totalViolationReports(totalViolationReports)
                .recycledWasteCount(recycledWasteCount)
                .build();
    }
}