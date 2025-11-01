package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.User;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service để xuất báo cáo PDF (FR-13.1.3)
 */
@Service
public class PdfExportService {

    private final ReportService reportService;

    public PdfExportService(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Tạo PDF báo cáo cá nhân cho user (FR-13.1.3)
     */
    public byte[] generateUserReportPdf(User user) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Tiêu đề
            Paragraph title = new Paragraph("BÁO CÁO CÁ NHÂN - BẢO VỆ MÔI TRƯỜNG")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(title);

            // Thông tin người dùng
            document.add(new Paragraph("Thông tin người dùng:")
                    .setBold()
                    .setMarginTop(10));
            document.add(new Paragraph("Họ tên: " + (user.getFullName() != null ? user.getFullName() : "N/A")));
            document.add(new Paragraph("Email: " + user.getEmail()));
            document.add(new Paragraph("Điểm thưởng: " + user.getPoints()));

            // Lấy danh sách báo cáo
            List<Report> reports = reportService.getUserReports(user);
            
            document.add(new Paragraph("\nDanh sách báo cáo vi phạm môi trường:")
                    .setBold()
                    .setMarginTop(15));

            if (reports.isEmpty()) {
                document.add(new Paragraph("Chưa có báo cáo nào."));
            } else {
                // Tạo bảng
                Table table = new Table(UnitValue.createPercentArray(new float[]{1, 3, 2, 2}))
                        .useAllAvailableWidth();

                // Header
                table.addHeaderCell(new Paragraph("ID").setBold());
                table.addHeaderCell(new Paragraph("Mô tả").setBold());
                table.addHeaderCell(new Paragraph("Trạng thái").setBold());
                table.addHeaderCell(new Paragraph("Ngày tạo").setBold());

                // Rows
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                for (Report report : reports) {
                    table.addCell(new Paragraph(String.valueOf(report.getId())));
                    table.addCell(new Paragraph(report.getDescription()));
                    table.addCell(new Paragraph(report.getStatus().name()));
                    table.addCell(new Paragraph(report.getCreatedAt().format(formatter)));
                }

                document.add(table);
            }

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Lỗi khi tạo PDF: " + e.getMessage());
        }
    }
}

