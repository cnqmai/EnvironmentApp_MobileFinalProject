package com.enviro.app.environment_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.enviro.app.environment_backend.dto.ReportRequest;
import com.enviro.app.environment_backend.dto.ReportStatusUpdateRequest;
import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.ReportService;
import com.enviro.app.environment_backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;

    public ReportController(ReportService reportService, UserService userService) {
        this.reportService = reportService;
        this.userService = userService;
    }

    // Phương thức tiện ích để lấy User đang đăng nhập từ JWT Token
    private User getCurrentUser() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName(); 
        
        return userService.findByEmail(userEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    /**
     * API TẠO BÁO CÁO (Protected - POST /api/reports)
     */
    @PostMapping
    public ResponseEntity<Report> createReport(@Valid @RequestBody ReportRequest request) {
        // Đảm bảo User đã đăng nhập
        User user = getCurrentUser();
        Report newReport = reportService.createReport(user, request);
        
        return new ResponseEntity<>(newReport, HttpStatus.CREATED);
    }
    
    /**
     * API QUẢN LÝ TRẠNG THÁI (Protected - PATCH /api/reports/{id}/status)
     * *LƯU Ý: Trong thực tế, API này cần thêm kiểm tra quyền ADMIN/MODERATOR.*
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Report> updateReportStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReportStatusUpdateRequest request) {
        
        // Đảm bảo User đã đăng nhập (Protected bởi SecurityConfig)
        
        Report updatedReport = reportService.updateReportStatus(id, request.getNewStatus());
        
        return ResponseEntity.ok(updatedReport);
    }
}