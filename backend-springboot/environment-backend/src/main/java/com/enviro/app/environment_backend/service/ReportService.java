package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.ReportRequest;
import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.ReportMedia;
import com.enviro.app.environment_backend.model.ReportStatus;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.WasteCategory;
import com.enviro.app.environment_backend.repository.ReportMediaRepository;
import com.enviro.app.environment_backend.repository.ReportRepository;
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

    public ReportService(ReportRepository reportRepository, 
                        ReportMediaRepository reportMediaRepository,
                        WasteCategoryRepository wasteCategoryRepository) {
        this.reportRepository = reportRepository;
        this.reportMediaRepository = reportMediaRepository;
        this.wasteCategoryRepository = wasteCategoryRepository;
    }

    /**
     * API TẠO BÁO CÁO (Logic chính)
     * Yêu cầu: Mô tả + Ảnh/Video + GPS + (tùy chọn) Category ID
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
        
        // 2. Tạo đối tượng Report chính
        Report.ReportBuilder reportBuilder = Report.builder()
            .user(user)
            .description(request.getDescription())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
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
        
        return savedReport;
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
        report.setStatus(newStatus); // Lỗi 73
        return reportRepository.save(report);
    }
}