package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.CommunityReportExportRequest;
import com.enviro.app.environment_backend.dto.ReportRequest;
import com.enviro.app.environment_backend.dto.ReportStatusUpdateRequest;
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

import jakarta.mail.MessagingException;
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
    private final PdfExportService pdfExportService;
    private final PasswordResetService mailService; // SỬ DỤNG PASSWORD RESET SERVICE ĐỂ GỬI MAIL

    public ReportService(ReportRepository reportRepository, 
                        ReportMediaRepository reportMediaRepository,
                        WasteCategoryRepository wasteCategoryRepository,
                        UserRepository userRepository,
                        BadgeService badgeService,
                        PdfExportService pdfExportService,
                        PasswordResetService mailService) { // KHỞI TẠO MAIL SERVICE
        this.reportRepository = reportRepository;
        this.reportMediaRepository = reportMediaRepository;
        this.wasteCategoryRepository = wasteCategoryRepository;
        this.userRepository = userRepository;
        this.badgeService = badgeService;
        this.pdfExportService = pdfExportService;
        this.mailService = mailService; // GÁN INSTANCE
    }

    /**
     * API TẠO BÁO CÁO (Logic chính)
     */
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
        
        // Cập nhật trạng thái
        report.setStatus(newStatus); 
        return reportRepository.save(report);
    }
    
    // --- FR-12.1.3: LOGIC XUẤT BÁO CÁO CỘNG ĐỒNG VÀ GỬI EMAIL ---
    /**
     * Xuất báo cáo cộng đồng dưới dạng PDF và gửi qua email cho người dùng.
     */
    public String exportCommunityReport(User user, CommunityReportExportRequest request) {
        
        byte[] pdfBytes;
        
        try {
            // 1. TẠO FILE PDF THỰC TẾ
            // Giả định pdfExportService trả về byte[]
            String userName = user.getFullName(); // Giả định User entity có getFullName()
            pdfBytes = pdfExportService.generateCommunityReportPdf(request, userName);

            String userEmail = user.getEmail();
            String communityName = request.getCommunityName();
            
            // 2. CHUẨN BỊ NỘI DUNG VÀ TÊN FILE
            
            // Tạo tên file đính kèm
            String safeCommunityName = communityName.replaceAll("[^a-zA-Z0-9_ -]", "");
            String attachmentFileName = String.format("%s_BaoCao_%s.pdf", 
                                                      safeCommunityName,
                                                      request.getExportedDate().toLocalDate().toString()); 

            // Nội dung chính trong thân mail (body của email)
            String emailBodyContent = "Báo cáo này bao gồm:<br>"
                                    + "<ul><li>Tóm tắt các chỉ số thống kê (Số thành viên, lượng rác tái chế, số chiến dịch, v.v.).</li>"
                                    + "<li>Danh sách chi tiết các báo cáo môi trường đã được gửi trong cộng đồng.</li></ul>";


            // 3. GỌI HÀM GỬI MAIL CÓ ĐÍNH KÈM TỪ PASSWORD/MAIL SERVICE
            mailService.sendReportEmailWithAttachment(
                userEmail, 
                userName, 
                communityName, 
                emailBodyContent, 
                pdfBytes, 
                attachmentFileName
            );
            
            return userEmail;

        } catch (MessagingException e) {
             System.err.println(">>> [REPORT EMAIL ERROR] " + e.getMessage());
             throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi gửi email báo cáo: " + e.getMessage());
        } catch (Exception e) {
             System.err.println(">>> [PDF/SERVER ERROR] " + e.getMessage());
             throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi nội bộ khi tạo hoặc xuất báo cáo: " + e.getMessage());
        }
    }
}