package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.ReportRequest;
import com.enviro.app.environment_backend.model.*;
import com.enviro.app.environment_backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReportMediaRepository reportMediaRepository;
    private final WasteCategoryRepository wasteCategoryRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService; // Inject BadgeService

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

    @Transactional
    public Report createReport(User user, ReportRequest request) {
        // 1. Xử lý logic tạo báo cáo (như cũ)
        WasteCategory category = null;
        if (request.getCategoryId() != null) {
            category = wasteCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        }

        double finalLat = user.isShareLocation() ? request.getLatitude() : 0.0;
        double finalLon = user.isShareLocation() ? request.getLongitude() : 0.0;

        Report newReport = Report.builder()
            .user(user)
            .description(request.getDescription())
            .latitude(finalLat)
            .longitude(finalLon)
            .status(ReportStatus.RECEIVED)
            .wasteCategory(category) // Gán danh mục rác
            .build();
        
        Report savedReport = reportRepository.save(newReport);

        // 2. Lưu Media (như cũ)
        if (request.getMedia() != null && !request.getMedia().isEmpty()) {
            List<ReportMedia> mediaList = request.getMedia().stream()
                .map(m -> ReportMedia.builder()
                    .report(savedReport)
                    .mediaUrl(m.getUrl())
                    .mediaType(m.getType().toLowerCase().contains("video") ? "video" : "image")
                    .build())
                .collect(Collectors.toList());
            reportMediaRepository.saveAll(mediaList);
            savedReport.setReportMedia(mediaList);
        }

        // 3. [GAMIFICATION] Cộng điểm thưởng (Ví dụ: 20 điểm/báo cáo)
        int pointsReward = 20;
        user.setPoints(user.getPoints() + pointsReward);
        User updatedUser = userRepository.save(user);

        // 4. [GAMIFICATION] Kiểm tra thăng cấp Huy hiệu
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