// Đặt tại: backend-springboot/environment-backend/src/main/java/com/enviro/app/environment_backend/controller/AuthController.java
package com.enviro.app.environment_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.enviro.app.environment_backend.dto.AuthResponse;
import com.enviro.app.environment_backend.dto.LoginRequest;
import com.enviro.app.environment_backend.dto.RegisterRequest;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.security.JwtService;
import com.enviro.app.environment_backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * API Đăng ký (POST /api/auth/register)
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        
        // Kiểm tra Email đã tồn tại
        if (userService.findByEmail(request.getEmail()).isPresent()) {
            // Trả về 409 Conflict nếu email đã tồn tại
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký.");
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setFullName(request.getFullName());
        
        // Mã hóa mật khẩu
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        newUser.setPasswordHash(hashedPassword);
        
        User savedUser = userService.save(newUser);

        // Tạo và trả về JWT
        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail());

        return ResponseEntity.ok(AuthResponse.builder()
            .userId(savedUser.getId().toString())
            .email(savedUser.getEmail())
            .fullName(savedUser.getFullName())
            .token(token)
            // tokenType sẽ tự động là "Bearer"
            .expires(System.currentTimeMillis() + 86400000)
            .build()
        );
    }

    /**
     * API Đăng nhập (POST /api/auth/login)
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        
        // 1. Tìm User
        User user = userService.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng."));

        // 2. So sánh mật khẩu đã hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng.");
        }

        // 3. Tạo JWT
        String token = jwtService.generateToken(user.getId(), user.getEmail());

        // 4. Trả về AuthResponse
        return ResponseEntity.ok(AuthResponse.builder()
            .userId(user.getId().toString())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .token(token)
            // tokenType sẽ tự động là "Bearer"
            .expires(System.currentTimeMillis() + 86400000)
            .build()
        );
    }
}