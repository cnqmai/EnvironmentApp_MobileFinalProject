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
        
        // 1. Xử lý Category ID nếu có
        WasteCategory category = null;
        if (request.getCategoryId() != null) {
            category = wasteCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, 
                    "Không tìm thấy danh mục rác với ID: " + request.getCategoryId()
                ));
        }
        
        // --- KIỂM TRA QUYỀN RIÊNG TƯ VỊ TRÍ (FR-7.3) ---
        double finalLat = request.getLatitude();
        double finalLon = request.getLongitude();

        // Giả định user.isShareLocation() tồn tại trong User.java
        if (!user.isShareLocation()) { 
            System.out.println("Privacy Alert: User location sharing is OFF. Using placeholder coordinates for report.");
            // Ghi tọa độ mặc định (0, 0) hoặc một vị trí an toàn để không lưu vị trí cá nhân
            finalLat = 0.0; 
            finalLon = 0.0; 
        }
        // ---------------------------------------------
        
        // 2. Tạo đối tượng Report chính
        Report.ReportBuilder reportBuilder = Report.builder()
            .user(user)
            .description(request.getDescription())
            .latitude(finalLat) // SỬ DỤNG finalLat
            .longitude(finalLon) // SỬ DỤNG finalLon
            .status(ReportStatus.RECEIVED); // Mặc định là RECEIVED khi mới tạo
        
        // Thêm category nếu có
        if (category != null) {
            reportBuilder.wasteCategory(category);
        }
        
        Report newReport = reportBuilder.build();
        
        // 3. Lưu Report (để có ID)
        Report savedReport = reportRepository.save(newReport);
        
        // 4. Tạo và lưu ReportMedia (nếu có)
        List<ReportMedia> mediaList = new ArrayList<>();
        if (request.getMedia() != null && !request.getMedia().isEmpty()) {
            mediaList = request.getMedia().stream()
                .map(mediaItem -> {
                    // Validate và normalize media type (chuyển về lowercase)
                    String normalizedType = normalizeMediaType(mediaItem.getType());
                    
                    return ReportMedia.builder()
                        .report(savedReport) // Liên kết khóa ngoại
                        .mediaUrl(mediaItem.getUrl())
                        .mediaType(normalizedType) // "image" hoặc "video"
                        .build();
                })
                .collect(Collectors.toList());
            
            reportMediaRepository.saveAll(mediaList);
        }
        
        // Cập nhật Report entity với mediaList đã được lưu
        savedReport.setReportMedia(mediaList);
        
        // 5. TỰ ĐỘNG CỘNG ĐIỂM CHO USER KHI TẠO BÁO CÁO (FR-9.1.1)
        // Mỗi báo cáo được tạo = 10 điểm
        int pointsToAdd = 10;
        user.setPoints(user.getPoints() + pointsToAdd);
        User updatedUser = userRepository.save(user);
        
        // 6. TỰ ĐỘNG TRAO BADGES NẾU ĐẠT ĐỦ ĐIỂM (FR-9.1.2)
        badgeService.checkAndAwardBadges(updatedUser);
        
        return savedReport;
    }
    
    /**
     * Lấy tất cả báo cáo của một user (FR-4.2.1)
     */
    public List<Report> getUserReports(User user) {
        return reportRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    /**
     * Đếm số lượng báo cáo của một user
     */
    public long countUserReports(User user) {
        return reportRepository.countByUser(user);
    }

    /**
     * Normalize media type để khớp với database enum ('image', 'video')
     */
    private String normalizeMediaType(String type) {
        if (type == null || type.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                "Loại media không hợp lệ. Phải là 'image' hoặc 'video'"
            );
        }
        
        String normalized = type.toLowerCase().trim();
        
        // Chấp nhận nhiều format input
        if (normalized.equals("image") || normalized.equals("img") || normalized.equals("photo") || normalized.equals("picture")) {
            return "image";
        } else if (normalized.equals("video") || normalized.equals("vid") || normalized.equals("mp4")) {
            return "video";
        } else {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                "Loại media không hợp lệ: " + type + ". Phải là 'image' hoặc 'video'"
            );
        }
    }

    /**
     * API QUẢN LÝ TRẠNG THÁI (Logic cập nhật)
     */
    @Transactional
    public Report updateReportStatus(Long reportId, ReportStatus newStatus) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo với ID: " + reportId));
        
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