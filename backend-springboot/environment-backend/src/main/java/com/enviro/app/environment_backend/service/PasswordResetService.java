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

    // --- SỬA DUY NHẤT DÒNG NÀY ---
    // Thay vì lấy IP LAN (chỉ chạy nội bộ), ta lấy link Ngrok để email gửi đi bấm được
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

    @Transactional
    public void createAndSendResetToken(User user) {
        // 1. Xóa token cũ
        PasswordResetToken existingToken = tokenRepository.findByUser(user);
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }

        // 2. Tạo token mới (GIỮ NGUYÊN CODE CỦA BẠN - DÙNG SETTER)
        String token = UUID.randomUUID().toString();
        OffsetDateTime expiryDate = OffsetDateTime.now().plusMinutes(expirationTimeMinutes);

        PasswordResetToken newToken = new PasswordResetToken();
        newToken.setToken(token);
        newToken.setUser(user);
        newToken.setExpiryDate(expiryDate); // Dùng OffsetDateTime như cũ
        tokenRepository.save(newToken);

        // 3. Tạo Link chuyển hướng
        String deepLink = frontendResetUrl + "?token=" + token;
        String httpLink = "";
        
        try {
            // Encode deepLink để truyền an toàn trên URL
            String encodedDeepLink = URLEncoder.encode(deepLink, StandardCharsets.UTF_8.toString());
            // Tạo link HTTP trỏ về API open-app của Backend
            httpLink = backendUrl + "/api/auth/open-app?url=" + encodedDeepLink;
        } catch (Exception e) {
            e.printStackTrace();
            httpLink = deepLink; // Fallback nếu lỗi
        }

        // 4. Gửi Email chứa HTTP Link
        try {
            sendHtmlEmail(user.getEmail(), httpLink, user.getFullName());
            System.out.println(">>> [EMAIL SENT] Đã gửi mail thành công tới: " + user.getEmail());
            System.out.println(">>> [LINK] " + httpLink);
        } catch (MessagingException e) {
            System.err.println(">>> [EMAIL ERROR] Không thể gửi mail: " + e.getMessage());
        }
    }

    // Hàm gửi email HTML
    private void sendHtmlEmail(String toAddress, String link, String name) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(toAddress);
        helper.setSubject("Yêu cầu đặt lại mật khẩu - Enviroment App");
        
        // Nội dung email dạng HTML
        String content = "<div style=\"font-family: Arial, sans-serif; padding: 20px;\">"
                + "<h2>Xin chào " + name + ",</h2>"
                + "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Enviroment App.</p>"
                + "<p>Vui lòng nhấn vào nút bên dưới để mở ứng dụng:</p>"
                
                // --- PHẦN LINK HTTP (Click được) ---
                + "<div style=\"margin: 30px 0;\">"
                + "  <a href=\"" + link + "\" style=\""
                + "    display: inline-block;"
                + "    background-color: #0088FF;"
                + "    color: white;"
                + "    padding: 12px 24px;"
                + "    text-decoration: none;"
                + "    border-radius: 6px;"
                + "    font-weight: bold;"
                + "  \">Đặt lại mật khẩu</a>"
                + "</div>"
                // ---------------------------
                
                + "<p style=\"font-size: 13px; color: #666;\">Nếu nút không hoạt động, hãy copy link dưới đây vào trình duyệt:</p>"
                + "<p style=\"font-size: 13px; color: #0088FF;\">" + link + "</p>"
                
                + "<hr style=\"margin-top: 20px; border: 0; border-top: 1px solid #eee;\"/>"
                + "<p>Link này sẽ hết hạn sau " + expirationTimeMinutes + " phút.</p>"
                + "<p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>"
                + "</div>";
        
        helper.setText(content, true); // true = html
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