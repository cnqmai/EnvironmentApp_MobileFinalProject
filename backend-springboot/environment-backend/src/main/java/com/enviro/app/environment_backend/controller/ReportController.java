package com.enviro.app.environment_backend.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.enviro.app.environment_backend.dto.ReportRequest;
import com.enviro.app.environment_backend.dto.ReportStatusUpdateRequest;
import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.PdfExportService;
import com.enviro.app.environment_backend.service.ReportService;
import com.enviro.app.environment_backend.service.UserService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;
    private final PdfExportService pdfExportService;

    public ReportController(ReportService reportService, UserService userService, PdfExportService pdfExportService) {
        this.reportService = reportService;
        this.userService = userService;
        this.pdfExportService = pdfExportService;
    }

    private User getCurrentUser() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName(); 
        
        return userService.findByEmail(userEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    @PostMapping
    public ResponseEntity<Report> createReport(@Valid @RequestBody ReportRequest request) {
        User user = getCurrentUser();
        Report newReport = reportService.createReport(user, request);
        return new ResponseEntity<>(newReport, HttpStatus.CREATED);
    }
    
    @GetMapping("/me")
    public ResponseEntity<List<Report>> getMyReports() {
        User user = getCurrentUser();
        List<Report> reports = reportService.getUserReports(user);
        return ResponseEntity.ok(reports);
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<Report> updateReportStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReportStatusUpdateRequest request) {
        Report updatedReport = reportService.updateReportStatus(id, request.getNewStatus());
        return ResponseEntity.ok(updatedReport);
    }
    
    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        User user = getCurrentUser();
        byte[] pdfBytes = pdfExportService.generateUserReportPdf(user);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "bao-cao-moi-truong.pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}