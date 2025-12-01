package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.CommunityReportExportRequest;
import com.enviro.app.environment_backend.dto.CommunityReportExportRequest.ReportDetail;
import com.enviro.app.environment_backend.model.Report;
import com.enviro.app.environment_backend.model.User;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.PdfEncodings; 

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.context.annotation.Lazy;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service để xuất báo cáo PDF (FR-13.1.3)
 */
@Service
public class PdfExportService {

    private final ReportService reportService;
    // ĐÃ XÓA: private final PdfFont vietnameseFont;

    private static final String FONT_RESOURCE_PATH = "fonts/BeVietnamPro-Regular.ttf"; 

    public PdfExportService(@Lazy ReportService reportService) {
        this.reportService = reportService;
        // KHÔNG CÒN LOGIC TẢI FONT TRONG CONSTRUCTOR
    }

    /**
     * Phương thức nội bộ để tải font an toàn (tải mỗi lần gọi hàm xuất)
     */
    private PdfFont loadVietnameseFontSafe() throws IOException {
        try {
            // Tải font bằng mảng byte
            byte[] fontContents = new ClassPathResource(FONT_RESOURCE_PATH).getInputStream().readAllBytes();
            
            // Cấu hình: Nhúng (FORCE_EMBEDDED) và Unicode (IDENTITY_H)
            return PdfFontFactory.createFont(fontContents, 
                                          PdfEncodings.IDENTITY_H, 
                                          PdfFontFactory.EmbeddingStrategy.FORCE_EMBEDDED); 
        } catch (IOException e) {
            System.err.println("LỖI KHÔNG TÌM THẤY FONT: " + FONT_RESOURCE_PATH + " - " + e.getMessage());
            // Fallback nếu font không tìm thấy hoặc lỗi tải
            try {
                 // Dùng font cơ bản (không hỗ trợ tiếng Việt)
                return PdfFontFactory.createFont(StandardFonts.HELVETICA); 
            } catch (IOException ex) {
                // Sẽ không xảy ra
                throw e; 
            }
        }
    }


    // --- FR-12.1.3: LOGIC TẠO PDF BÁO CÁO CỘNG ĐỒNG ---
    public byte[] generateCommunityReportPdf(CommunityReportExportRequest request, String exportedByFullName) {
        try {
            // TẢI FONT MỖI KHI TẠO TÀI LIỆU
            PdfFont vietnameseFont = loadVietnameseFontSafe(); 
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // ... (Phần logic tạo tài liệu, sử dụng vietnameseFont)
            // Tiêu đề
            Paragraph title = new Paragraph("BÁO CÁO HOẠT ĐỘNG CỘNG ĐỒNG")
                    .setFont(vietnameseFont)
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(10);
            document.add(title);
            
            // Tên Cộng đồng
            document.add(new Paragraph("Cộng đồng: " + request.getCommunityName())
                    .setFont(vietnameseFont)
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // 1. THÔNG TIN THỐNG KÊ CHUNG
            document.add(new Paragraph("1. Tóm tắt Thống kê Cộng đồng")
                    .setFont(vietnameseFont)
                    .setBold()
                    .setMarginTop(10));
            
            Table statsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}))
                    .useAllAvailableWidth();
            
            // Header
            statsTable.addHeaderCell(new Paragraph("Thành viên").setBold().setFont(vietnameseFont));
            statsTable.addHeaderCell(new Paragraph("Chiến dịch").setBold().setFont(vietnameseFont));
            statsTable.addHeaderCell(new Paragraph("Lượng rác Tái chế (Kg)").setBold().setFont(vietnameseFont));
            statsTable.addHeaderCell(new Paragraph("Báo cáo đã gửi").setBold().setFont(vietnameseFont));
            
            // Data
            statsTable.addCell(new Paragraph(String.valueOf(request.getStats().getMemberCount())).setFont(vietnameseFont));
            statsTable.addCell(new Paragraph(String.valueOf(request.getStats().getMockCampaigns())).setFont(vietnameseFont));
            statsTable.addCell(new Paragraph(String.format("%,.2f", request.getStats().getRecycledWasteKg())).setFont(vietnameseFont));
            statsTable.addCell(new Paragraph(String.valueOf(request.getStats().getTotalReports())).setFont(vietnameseFont));
            
            document.add(statsTable);
            
            // 2. DANH SÁCH BÁO CÁO CHI TIẾT
            List<ReportDetail> reportDetails = request.getReportsDetail();
            
            document.add(new Paragraph("\n2. Chi tiết Báo cáo đã gửi")
                    .setFont(vietnameseFont)
                    .setBold()
                    .setMarginTop(20));
            
            if (reportDetails.isEmpty()) {
                document.add(new Paragraph("Cộng đồng chưa có báo cáo nào trong khoảng thời gian này.").setFont(vietnameseFont));
            } else {
                // Tạo bảng chi tiết báo cáo
                Table detailTable = new Table(UnitValue.createPercentArray(new float[]{1, 3, 2, 2}))
                        .useAllAvailableWidth();

                // Header
                detailTable.addHeaderCell(new Paragraph("ID").setBold().setFont(vietnameseFont));
                detailTable.addHeaderCell(new Paragraph("Mô tả").setBold().setFont(vietnameseFont));
                detailTable.addHeaderCell(new Paragraph("Trạng thái").setBold().setFont(vietnameseFont));
                detailTable.addHeaderCell(new Paragraph("Ngày tạo").setBold().setFont(vietnameseFont));

                // Rows
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                for (ReportDetail report : reportDetails) {
                    detailTable.addCell(new Paragraph(String.valueOf(report.getId())).setFont(vietnameseFont));
                    detailTable.addCell(new Paragraph(report.getDescription()).setFont(vietnameseFont));
                    detailTable.addCell(new Paragraph(report.getStatus()).setFont(vietnameseFont));
                    // Chuyển OffsetDateTime thành String
                    detailTable.addCell(new Paragraph(report.getDate().format(formatter)).setFont(vietnameseFont));
                }

                document.add(detailTable);
            }

            // Footer
            document.add(new Paragraph("\n\nBáo cáo được xuất bởi: " + exportedByFullName)
                    .setFont(vietnameseFont)
                    .setFontSize(10));
            document.add(new Paragraph("Thời gian xuất: " + request.getExportedDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")))
                    .setFont(vietnameseFont)
                    .setFontSize(10));

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            System.err.println("Lỗi tạo PDF cộng đồng: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Lỗi khi tạo PDF báo cáo cộng đồng: " + e.getMessage());
        }
    }
    // --- KẾT THÚC LOGIC BÁO CÁO CỘNG ĐỒNG ---

    /**
     * Tạo PDF báo cáo cá nhân cho user (FR-13.1.3)
     */
    public byte[] generateUserReportPdf(User user) {
        try {
            // TẢI FONT MỖI KHI TẠO TÀI LIỆU
            PdfFont vietnameseFont = loadVietnameseFontSafe(); 
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Tiêu đề
            Paragraph title = new Paragraph("BÁO CÁO CÁ NHÂN - BẢO VỆ MÔI TRƯỜNG")
                    .setFont(vietnameseFont)
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(title);

            // Thông tin người dùng
            document.add(new Paragraph("Thông tin người dùng:")
                    .setFont(vietnameseFont)
                    .setBold()
                    .setMarginTop(10));
            document.add(new Paragraph("Họ tên: " + (user.getFullName() != null ? user.getFullName() : "N/A"))
                    .setFont(vietnameseFont));
            document.add(new Paragraph("Email: " + user.getEmail())
                    .setFont(vietnameseFont));
            document.add(new Paragraph("Điểm thưởng: " + user.getPoints())
                    .setFont(vietnameseFont));

            // Lấy danh sách báo cáo
            List<Report> reports = reportService.getUserReports(user);
            
            document.add(new Paragraph("\nDanh sách báo cáo vi phạm môi trường:")
                    .setFont(vietnameseFont)
                    .setBold()
                    .setMarginTop(15));

            if (reports.isEmpty()) {
                document.add(new Paragraph("Chưa có báo cáo nào.").setFont(vietnameseFont));
            } else {
                // Tạo bảng
                Table table = new Table(UnitValue.createPercentArray(new float[]{1, 3, 2, 2}))
                        .useAllAvailableWidth();

                // Header
                table.addHeaderCell(new Paragraph("ID").setBold().setFont(vietnameseFont));
                table.addHeaderCell(new Paragraph("Mô tả").setBold().setFont(vietnameseFont));
                table.addHeaderCell(new Paragraph("Trạng thái").setBold().setFont(vietnameseFont));
                table.addHeaderCell(new Paragraph("Ngày tạo").setBold().setFont(vietnameseFont));

                // Rows
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                for (Report report : reports) {
                    table.addCell(new Paragraph(String.valueOf(report.getId())).setFont(vietnameseFont));
                    table.addCell(new Paragraph(report.getDescription()).setFont(vietnameseFont));
                    table.addCell(new Paragraph(report.getStatus().name()).setFont(vietnameseFont));
                    table.addCell(new Paragraph(report.getCreatedAt().format(formatter)).setFont(vietnameseFont));
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