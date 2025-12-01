package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.ReportRequest;
import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.ReportMedia;
import com.enviro.app.environment_backend.model.ReportStatus;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.WasteCategory;
import com.enviro.app.environment_backend.repository.ReportMediaRepository;
import com.enviro.app.environment_backend.repository.ReportRepository;
import com.enviro.app.environment_backend.repository.UserRepository;
import com.enviro.app.environment_backend.repository.WasteCategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReportMediaRepository reportMediaRepository;
    private final WasteCategoryRepository wasteCategoryRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService;
    // Đã loại bỏ FileService ở đây vì method createReport bên dưới dùng URL từ request

    public ReportService(ReportRepository reportRepository, 
                        ReportMediaRepository reportMediaRepository,
                        WasteCategoryRepository wasteCategoryRepository,
                        UserRepository userRepository,
                        BadgeService badgeService) {
        this.reportRepository = reportRepository;
        this.reportMediaRepository = reportMediaRepository;
        this.wasteCategoryRepository = wasteCategoryRepository;
        this.userRepository = userRepository;
        this.badgeService = badgeService;
    }

    /**
     * API TẠO BÁO CÁO
     */
    @Transactional
    public Report createReport(User user, ReportRequest request) {
        
        // 1. Xử lý Category ID nếu có
        WasteCategory category = null;
        if (request.getCategoryId() != null) {
            category = wasteCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, 
                    "Không tìm thấy danh mục rác với ID: " + request.getCategoryId()
                ));
        }
        
        // 2. Kiểm tra quyền riêng tư vị trí
        double finalLat = request.getLatitude();
        double finalLon = request.getLongitude();

        if (!user.isShareLocation()) { 
            // Nếu user tắt chia sẻ vị trí, set về 0 hoặc null tùy logic
            finalLat = 0.0; 
            finalLon = 0.0; 
        }
        
        // 3. Tạo đối tượng Report
        Report.ReportBuilder reportBuilder = Report.builder()
            .user(user)
            .description(request.getDescription())
            .latitude(finalLat)
            .longitude(finalLon)
            .status(ReportStatus.RECEIVED);
        
        if (category != null) {
            reportBuilder.wasteCategory(category);
        }
        
        Report newReport = reportBuilder.build();
        Report savedReport = reportRepository.save(newReport);
        
        // 4. Lưu ReportMedia (Dữ liệu từ Frontend gửi lên là URL)
        if (request.getMedia() != null && !request.getMedia().isEmpty()) {
            List<ReportMedia> mediaList = request.getMedia().stream()
                .map(mediaItem -> {
                    String normalizedType = normalizeMediaType(mediaItem.getType());
                    return ReportMedia.builder()
                        .report(savedReport)
                        .mediaUrl(mediaItem.getUrl())
                        .mediaType(normalizedType)
                        .build();
                })
                .collect(Collectors.toList());
            
            reportMediaRepository.saveAll(mediaList);
            savedReport.setReportMedia(mediaList);
        }
        
        // 5. Cộng điểm (10 điểm/báo cáo)
        int pointsToAdd = 10;
        user.setPoints(user.getPoints() + pointsToAdd);
        User updatedUser = userRepository.save(user);
        
        // 6. Kiểm tra và cấp Badge (Sử dụng đúng tên hàm trong BadgeService)
        badgeService.checkAndAssignBadges(updatedUser);
        
        return savedReport;
    }
    
    public List<Report> getUserReports(User user) {
        return reportRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public long countUserReports(User user) {
        return reportRepository.countByUser(user);
    }

    private String normalizeMediaType(String type) {
        if (type == null || type.isBlank()) return "image";
        String normalized = type.toLowerCase().trim();
        if (normalized.contains("vid") || normalized.equals("mp4")) return "video";
        return "image";
    }

    @Transactional
    public Report updateReportStatus(Long reportId, ReportStatus newStatus) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        
        report.setStatus(newStatus);
        return reportRepository.save(report);
    }
}