package com.enviro.app.environment_backend.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enviro.app.environment_backend.model.PasswordResetToken;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.PasswordResetTokenRepository;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserService userService;
    // Bỏ qua EmailService thực tế để đơn giản hóa quá trình debug
    // private final EmailService emailService; 

    @Value("${password.reset.expiration.minutes:15}") // Mặc định 15 phút
    private int expirationTimeMinutes; 

    public PasswordResetService(PasswordResetTokenRepository tokenRepository, UserService userService) {
        this.tokenRepository = tokenRepository;
        this.userService = userService;
    }

    /**
     * Tạo và lưu Token reset mật khẩu, sau đó mô phỏng gửi email.
     */
    @Transactional
    public void createAndSendResetToken(User user) {
        // 1. Kiểm tra xem user đã có Token chưa (nếu có, xóa Token cũ)
        PasswordResetToken existingToken = tokenRepository.findByUser(user);
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }

        // 2. Tạo Token mới và thời gian hết hạn
        String token = UUID.randomUUID().toString();
        OffsetDateTime expiryDate = OffsetDateTime.now().plusMinutes(expirationTimeMinutes);

        PasswordResetToken newToken = new PasswordResetToken(null, token, user, expiryDate);
        tokenRepository.save(newToken);

        // 3. Mô phỏng gửi Email
        String resetUrl = "http://YOUR_FRONTEND_URL/reset-password?token=" + token;
        System.out.println(">>> [RESET TOKEN]: " + token);
        System.out.println(">>> Đã gửi email reset mật khẩu đến: " + user.getEmail() + ". Link: " + resetUrl);
    }
    
    /**
     * Lấy Token dựa trên chuỗi Token (dùng trong API reset-password).
     */
    public PasswordResetToken getToken(String token) {
        return tokenRepository.findByToken(token);
    }
    
    /**
     * Xóa Token sau khi đã đặt lại mật khẩu thành công.
     */
    @Transactional
    public void deleteToken(PasswordResetToken token) {
        tokenRepository.delete(token);
    }
}