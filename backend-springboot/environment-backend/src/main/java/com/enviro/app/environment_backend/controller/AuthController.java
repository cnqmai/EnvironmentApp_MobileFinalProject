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

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký.");
        }
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User newUser = User.builder()
            .email(request.getEmail())
            .fullName(request.getFullName())
            .passwordHash(hashedPassword)
            .avatarUrl("") 
            .defaultLocation("") 
            .points(0) 
            .build();
        User savedUser = userService.save(newUser);
        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail());
        return ResponseEntity.ok(AuthResponse.builder()
            .userId(savedUser.getId().toString())
            .email(savedUser.getEmail())
            .fullName(savedUser.getFullName())
            .token(token)
            .expires(System.currentTimeMillis() + 86400000)
            .build()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng."));

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

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody OAuth2LoginRequest request) {
        try {
            User user = oAuth2Service.processGoogleLogin(request.getToken());
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
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Xác thực Google thất bại: " + e.getMessage());
        }
    }
    
    @PostMapping("/facebook")
    public ResponseEntity<AuthResponse> facebookLogin(@Valid @RequestBody OAuth2LoginRequest request) {
        try {
            User user = oAuth2Service.processFacebookLogin(request.getToken());
            String token = jwtService.generateToken(user.getId(), user.getEmail());
            return ResponseEntity.ok(AuthResponse.builder()
                    .userId(user.getId().toString())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .token(token)
                    .expires(System.currentTimeMillis() + 86400000)
                    .build());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Xác thực Facebook thất bại: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody EmailRequest request) {
        User user = userService.findByEmail(request.getEmail()).orElse(null); 
        if (user != null) {
            passwordResetService.createAndSendResetToken(user);
        }
        return ResponseEntity.ok("Nếu email tồn tại, link reset mật khẩu đã được gửi đi.");
    }

    /**
     * API cầu nối: Nhận request HTTP và chuyển hướng (Redirect) sang Deep Link (exp://)
     */
    @GetMapping("/open-app")
    public ResponseEntity<Void> openApp(@RequestParam("url") String url) {
        // Trả về mã 302 (Found) để trình duyệt tự động chuyển hướng
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url))
                .build();
    }
    
    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
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

    // ========================================================================
    // 2. API MỚI: Dành riêng cho GOOGLE LOGIN Callback
    // Endpoint: /api/auth/callback/google
    // ========================================================================
    @GetMapping("/callback/google")
    public ResponseEntity<Void> googleCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error) {

        String appScheme = "exp://duqqiw0-cnqmai-8081.exp.direct/--/";

        if (error != null) {
             String errorUrl = appScheme + "?error=" + URLEncoder.encode(error, StandardCharsets.UTF_8);
             return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(errorUrl)).build();
        }

        if (code != null) {
            try {
                // Đổi code lấy User
                User user = oAuth2Service.processGoogleCode(code);
                String token = jwtService.generateToken(user.getId(), user.getEmail());
                
                // Redirect về App với Token
                String deepLink = appScheme + "?token=" + token + "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);
                return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(deepLink)).build();
            } catch (Exception e) {
                e.printStackTrace();
                String errLink = appScheme + "?error=" + URLEncoder.encode("Login Error", StandardCharsets.UTF_8);
                return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(errLink)).build();
            }
        }
        return ResponseEntity.badRequest().build();
    }
}