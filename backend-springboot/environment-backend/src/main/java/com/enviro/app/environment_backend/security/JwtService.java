// Đặt tại: backend-springboot/environment-backend/src/main/java/com/enviro/app/environment_backend/security/JwtService.java
package com.enviro.app.environment_backend.security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    // Lấy secret key và thời gian hết hạn từ application.properties (Sẽ cấu hình ở bước sau)
    @Value("${jwt.secret.key}")
    private String secretKey;

    @Value("${jwt.expiration.ms}")
    private long expirationMs; 

    /**
     * Tạo token JWT cho người dùng.
     */
    public String generateToken(UUID userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        // Lưu trữ ID và Email vào claims
        claims.put("userId", userId.toString());
        claims.put("email", email); 
        
        return buildToken(claims, email, expirationMs);
    }

    private String buildToken(Map<String, Object> claims, String subject, long expirationMs) {
        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date expiration = new Date(now + expirationMs);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) 
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Ký token bằng secret key
                .compact();
    }

    // Giải mã Secret Key từ Base64 để tạo Key bảo mật
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}