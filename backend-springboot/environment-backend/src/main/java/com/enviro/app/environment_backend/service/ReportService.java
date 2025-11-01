package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.ReportRequest;
import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.ReportMedia;
import com.enviro.app.environment_backend.model.ReportStatus;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.ReportMediaRepository;
import com.enviro.app.environment_backend.repository.ReportRepository;
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

    public ReportService(ReportRepository reportRepository, ReportMediaRepository reportMediaRepository) {
        this.reportRepository = reportRepository;
        this.reportMediaRepository = reportMediaRepository;
    }

    /**
     * API TẠO BÁO CÁO (Logic chính)
     */
    @Transactional
    public Report createReport(User user, ReportRequest request) {
        
        // 1. Tạo đối tượng Report chính
        Report newReport = Report.builder()
            .user(user)
            .description(request.getDescription())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .status(ReportStatus.RECEIVED) // Mặc định là RECEIVED khi mới tạo
            .build();
        
        // 2. Lưu Report (để có ID)
        Report savedReport = reportRepository.save(newReport);
        
        // 3. Tạo và lưu ReportMedia
        List<ReportMedia> mediaList = request.getMedia().stream()
            .map(mediaItem -> ReportMedia.builder()
                .report(savedReport) // Liên kết khóa ngoại
                .mediaUrl(mediaItem.getUrl())
                .mediaType(mediaItem.getType())
                .build())
            .collect(Collectors.toList());
        
        reportMediaRepository.saveAll(mediaList);
        
        // Cập nhật Report entity với mediaList đã được lưu
        savedReport.setReportMedia(mediaList); 
        
        return savedReport;
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
}