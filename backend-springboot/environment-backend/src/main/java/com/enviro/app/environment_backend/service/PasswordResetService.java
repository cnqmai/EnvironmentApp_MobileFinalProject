package com.enviro.app.environment_backend.service;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enviro.app.environment_backend.model.PasswordResetToken;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.PasswordResetTokenRepository;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserService userService;
    private final JavaMailSender mailSender;
    
    @Value("${password.reset.expiration.minutes:15}")
    private int expirationTimeMinutes; 

    // Link Deep Link của App (Expo)
    @Value("${password.frontend.reset-password-url}")
    private String frontendResetUrl; 

    // Link backend dùng ngrok để truy cập từ ngoài internet
    private String backendUrl = "https://eructative-prodeportation-nikola.ngrok-free.dev";
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository, 
                                UserService userService,
                                JavaMailSender mailSender) {
        this.tokenRepository = tokenRepository;
        this.userService = userService;
        this.mailSender = mailSender;
    }

    // --- GIỮ NGUYÊN HÀM RESET PASSWORD CŨ CỦA BẠN ---
    @Transactional
    public void createAndSendResetToken(User user) {
       // ... (Code cũ giữ nguyên)
       // Copy lại y nguyên nội dung hàm createAndSendResetToken từ file bạn gửi
        PasswordResetToken existingToken = tokenRepository.findByUser(user);
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }

        String token = UUID.randomUUID().toString();
        OffsetDateTime expiryDate = OffsetDateTime.now().plusMinutes(expirationTimeMinutes);

        PasswordResetToken newToken = new PasswordResetToken();
        newToken.setToken(token);
        newToken.setUser(user);
        newToken.setExpiryDate(expiryDate);
        tokenRepository.save(newToken);

        String deepLink = frontendResetUrl + "?token=" + token;
        String httpLink = "";
        
        try {
            String encodedDeepLink = URLEncoder.encode(deepLink, StandardCharsets.UTF_8.toString());
            httpLink = backendUrl + "/api/auth/open-app?url=" + encodedDeepLink;
        } catch (Exception e) {
            e.printStackTrace();
            httpLink = deepLink;
        }

        try {
            sendHtmlEmail(user.getEmail(), httpLink, user.getFullName(), "RESET");
            System.out.println(">>> [RESET PASSWORD] Email sent to: " + user.getEmail());
        } catch (MessagingException e) {
            System.err.println(">>> [EMAIL ERROR] " + e.getMessage());
        }
    }

    // --- THÊM HÀM MỚI: GỬI MAIL XÁC THỰC TÀI KHOẢN ---
    @Transactional
    public void createAndSendVerificationToken(User user) {
        // 1. Xóa token cũ nếu có (dọn dẹp rác)
        PasswordResetToken existingToken = tokenRepository.findByUser(user);
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }

        // 2. Tạo token mới
        String token = UUID.randomUUID().toString();
        // Thời gian hết hạn cho xác thực có thể lâu hơn (ví dụ 24h)
        OffsetDateTime expiryDate = OffsetDateTime.now().plusHours(24); 

        PasswordResetToken newToken = new PasswordResetToken();
        newToken.setToken(token);
        newToken.setUser(user);
        newToken.setExpiryDate(expiryDate);
        tokenRepository.save(newToken);

        // 3. Tạo Link HTTP gọi thẳng API Backend
        // Khác với Reset Pass (cần mở App), Verify Email chỉ cần gọi API server là xong
        // Link dạng: https://.../api/auth/verify-email?token=...
        String verifyLink = backendUrl + "/api/auth/verify-email?token=" + token;

        // 4. Gửi Email
        try {
            sendHtmlEmail(user.getEmail(), verifyLink, user.getFullName(), "VERIFY");
            System.out.println(">>> [VERIFY EMAIL] Email sent to: " + user.getEmail());
        } catch (MessagingException e) {
            System.err.println(">>> [EMAIL ERROR] " + e.getMessage());
        }
    }

    // --- FR-12.1.3: HÀM MỚI GỬI EMAIL BÁO CÁO CỘNG ĐỒNG CÓ ĐÍNH KÈM FILE ---
    public void sendReportEmailWithAttachment(
        String toAddress, 
        String name, 
        String communityName, 
        String contentBody, 
        byte[] attachmentBytes, 
        String attachmentFileName
    ) throws MessagingException {
        
        MimeMessage message = mailSender.createMimeMessage();
        // Cần 'true' cho tham số thứ hai để bật chế độ multipart (hỗ trợ attachment)
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); 
        
        helper.setFrom(fromEmail);
        helper.setTo(toAddress);
        
        // --- 1. ĐỊNH NGHĨA NỘI DUNG ---
        String subject = String.format("Báo cáo Hoạt động Cộng đồng \"%s\" - Enviroment App", communityName);
        
        helper.setSubject(subject);
        
        // --- 2. TẠO NỘI DUNG HTML ---
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px;\">"
                        + "<h2>Xin chào " + name + ",</h2>"
                        + "<p>Chúng tôi đã hoàn tất việc xuất báo cáo chi tiết cho Cộng đồng <b>" + communityName + "</b>.</p>"
                        + "<p>" + contentBody + "</p>" // Nội dung từ ReportService
                        + "<p>File báo cáo PDF <b>" + attachmentFileName + "</b> đã được đính kèm theo email này.</p>"
                        + "<p>Xin cảm ơn vì những đóng góp tích cực của bạn cho cộng đồng.</p>"
                        + "<p style=\"margin-top: 30px;\">Trân trọng,<br>Đội ngũ Enviroment App</p>"
                        + "</div>";

        helper.setText(htmlContent, true);
        
        // --- 3. ĐÍNH KÈM FILE (ATTACHMENT) ---
        // Giả định attachmentBytes là byte[] của file PDF
        // Cần import jakarta.activation.DataSource nếu không dùng ByteArrayDataSource
        helper.addAttachment(attachmentFileName, new jakarta.mail.util.ByteArrayDataSource(attachmentBytes, "application/pdf"));
        
        // --- 4. GỬI MAIL ---
        mailSender.send(message);
        System.out.println(">>> [COMMUNITY REPORT] Email sent to: " + toAddress + " with attachment: " + attachmentFileName);
    }

    // Hàm gửi email chung (đã sửa để hỗ trợ 2 loại mail)
    private void sendHtmlEmail(String toAddress, String link, String name, String type) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(toAddress);
        
        String subject = "";
        String title = "";
        String body = "";
        String buttonText = "";
        
        if ("RESET".equals(type)) {
            subject = "Yêu cầu đặt lại mật khẩu - Enviroment App";
            title = "Yêu cầu đặt lại mật khẩu";
            body = "Bạn đã yêu cầu đặt lại mật khẩu. Nhấn nút dưới để mở ứng dụng:";
            buttonText = "Đặt lại mật khẩu";
        } else {
            subject = "Xác thực tài khoản - Enviroment App";
            title = "Chào mừng đến với Enviroment App!";
            body = "Cảm ơn bạn đã đăng ký. Vui lòng xác thực email để kích hoạt tài khoản:";
            buttonText = "Xác thực ngay";
        }
        
        helper.setSubject(subject);
        
        String content = "<div style=\"font-family: Arial, sans-serif; padding: 20px;\">"
                + "<h2>Xin chào " + name + ",</h2>"
                + "<p>" + body + "</p>"
                + "<div style=\"margin: 30px 0;\">"
                + "  <a href=\"" + link + "\" style=\""
                + "    display: inline-block;"
                + "    background-color: #0088FF;"
                + "    color: white;"
                + "    padding: 12px 24px;"
                + "    text-decoration: none;"
                + "    border-radius: 6px;"
                + "    font-weight: bold;"
                + "  \">" + buttonText + "</a>"
                + "</div>"
                + "<p style=\"font-size: 13px; color: #666;\">Hoặc copy link này:</p>"
                + "<p style=\"font-size: 13px; color: #0088FF;\">" + link + "</p>"
                + "</div>";
        
        helper.setText(content, true);
        mailSender.send(message);
    }
    
    public PasswordResetToken getToken(String token) {
        return tokenRepository.findByToken(token);
    }
    
    @Transactional
    public void deleteToken(PasswordResetToken token) {
        tokenRepository.delete(token);
    }
}