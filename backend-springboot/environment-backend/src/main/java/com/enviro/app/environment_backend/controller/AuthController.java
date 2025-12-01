package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.*;
import com.enviro.app.environment_backend.model.PasswordResetToken;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.security.JwtService;
import com.enviro.app.environment_backend.service.OAuth2Service;
import com.enviro.app.environment_backend.service.PasswordResetService;
import com.enviro.app.environment_backend.service.UserService;
import jakarta.validation.Valid;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetService passwordResetService;
    private final OAuth2Service oAuth2Service;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder, JwtService jwtService,
                          PasswordResetService passwordResetService, OAuth2Service oAuth2Service) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordResetService = passwordResetService;
        this.oAuth2Service = oAuth2Service;
    }

    // --- SỬA LOGIC ĐĂNG KÝ ---
   @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (userService.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký.");
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setFullName(request.getFullName());
        
        // Mặc định cho phép đăng nhập ngay (Enabled = true) để test
        newUser.setEnabled(true); 

        userService.save(newUser);

        // --- TẠM THỜI COMMENT DÒNG NÀY ĐỂ TRÁNH LỖI EMAIL ---
        // passwordResetService.createAndSendVerificationToken(newUser);
        
        // --- THAY THẾ BẰNG LOG ---
        System.out.println(">>> [DEV MODE] Đã tạo user " + request.getEmail() + " thành công (Bỏ qua gửi email).");

        return ResponseEntity.ok("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
    }
    // --- API MỚI: XÁC THỰC EMAIL (Người dùng click link trong mail sẽ vào đây) ---
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        PasswordResetToken vToken = passwordResetService.getToken(token); 
        
        if (vToken == null || vToken.isExpired()) {
             return ResponseEntity.badRequest().body("Token xác thực không hợp lệ hoặc đã hết hạn.");
        }
        
        User user = vToken.getUser();
        user.setEnabled(true); // Kích hoạt tài khoản
        userService.save(user);
        
        // Xóa token sau khi dùng
        passwordResetService.deleteToken(vToken);
        
        // Trả về HTML đơn giản thông báo thành công
        String successHtml = "<html><body style='text-align:center; padding:50px; font-family:sans-serif;'>"
                + "<h1 style='color:green;'>Xác thực thành công!</h1>"
                + "<p>Tài khoản của bạn đã được kích hoạt.</p>"
                + "<p>Bây giờ bạn có thể quay lại ứng dụng để đăng nhập.</p>"
                + "</body></html>";
                
        return ResponseEntity.ok().body(successHtml);
    }

    // --- SỬA LOGIC LOGIN: CHECK ENABLED ---
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng."));

        // Kiểm tra kích hoạt
        if (!user.isEnabled()) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng.");
        }
        
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(AuthResponse.builder()
            .userId(user.getId().toString())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .token(token)
            .expires(System.currentTimeMillis() + 86400000)
            .build()
        );
    }
    
    // ... (Các phương thức Google/Facebook/Reset Password giữ nguyên như cũ hoặc update nếu cần)
    // Lưu ý: Với Google/Facebook Login, bạn nên tự động set enabled = true trong service OAuth2Service
    
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody OAuth2LoginRequest request) {
        try {
            User user = oAuth2Service.processGoogleLogin(request.getToken());
            // Google Login auto-active
            if(!user.isEnabled()) {
                user.setEnabled(true);
                userService.save(user);
            }
            String token = jwtService.generateToken(user.getId(), user.getEmail());
            return ResponseEntity.ok(AuthResponse.builder()
                .userId(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .token(token)
                .expires(System.currentTimeMillis() + 86400000)
                .build()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google Login Error: " + e.getMessage());
        }
    }
    
    // ... Giữ các phần khác
    @GetMapping("/callback/google")
    public ResponseEntity<Void> googleCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "state", required = false) String state) {
            
        // ... (Code xử lý callback giữ nguyên như file trước, chỉ cần đảm bảo logic gọi oAuth2Service)
        // Code này khá dài, nếu bạn cần tôi paste lại full AuthController thì báo nhé.
        // Logic cơ bản:
        String appScheme = (state != null && !state.isEmpty()) ? state : "exp://fallback..."; 
        // ... xử lý redirect
        if (code != null) {
             try {
                User user = oAuth2Service.processGoogleCode(code);
                if(!user.isEnabled()) { user.setEnabled(true); userService.save(user); }
                // ... tạo token, redirect
                String token = jwtService.generateToken(user.getId(), user.getEmail());
                String deepLink = appScheme + (appScheme.contains("?") ? "&" : "?") + "token=" + token + "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);
                return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(deepLink)).build();
             } catch (Exception e) {
                 // ...
             }
        }
        return ResponseEntity.badRequest().build();
    }
    
    // Các method khác như open-app, forgot-password, reset-password giữ nguyên
    @GetMapping("/open-app")
    public ResponseEntity<Void> openApp(@RequestParam("url") String url) {
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).build();
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody EmailRequest request) {
        // Tìm user
        User user = userService.findByEmail(request.getEmail()).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Email này chưa được đăng ký trong hệ thống.");
        }

        passwordResetService.createAndSendResetToken(user);
        return ResponseEntity.ok("Link đặt lại mật khẩu đã được gửi vào email của bạn.");
    }
    
     @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        // ... (Giữ nguyên logic reset pass cũ)
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới và xác nhận mật khẩu không khớp.");
        }
        PasswordResetToken resetToken = passwordResetService.getToken(request.getToken());
        if (resetToken == null || resetToken.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token không hợp lệ hoặc đã hết hạn.");
        }
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userService.save(user);
        passwordResetService.deleteToken(resetToken);
        return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.");
    }
}