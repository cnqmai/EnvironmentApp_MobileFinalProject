package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
public class OAuth2Service {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private static final Logger logger = LoggerFactory.getLogger(OAuth2Service.class);

    @Value("#{'${app.security.google.client-ids}'.split(',')}") 
    private String[] allowedClientIds;
    
    // --- CẦN THÊM 2 BIẾN NÀY TỪ CONFIG ---
    // Vì trao đổi code cần Client Secret (bảo mật phía server)
    @Value("${app.security.google.client-secret}")
    private String googleClientSecret;
    
    // Link này phải KHỚP 100% với redirect_uri bạn gửi ở Frontend (link Ngrok)
    @Value("${app.security.google.redirect-uri}") 
    private String googleRedirectUri;

    @PostConstruct
    public void init() {
        logger.info("OAuth2Service initialized with allowed Google Client IDs");
        for (String id : allowedClientIds) {
            logger.info("  - {}", id.trim());
        }
    }

    public OAuth2Service(UserRepository userRepository, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    // --- MỚI: XỬ LÝ AUTH CODE (Server-Side Flow) ---
    public User processGoogleCode(String authorizationCode) {
        try {
            // 1. Chuẩn bị request gửi lên Google để đổi Code lấy Token
            String tokenEndpoint = "https://oauth2.googleapis.com/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", authorizationCode);
            // Client ID Web (cái đuôi ...lorj)
            params.add("client_id", allowedClientIds[allowedClientIds.length - 1].trim()); 
            params.add("client_secret", googleClientSecret);
            params.add("redirect_uri", googleRedirectUri); // Link Ngrok
            params.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            logger.info("Exchanging Google Code for Tokens...");
            
            // 2. Gửi Request POST
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // 3. Lấy ID Token từ kết quả trả về
                String idTokenString = (String) response.getBody().get("id_token");
                String accessToken = (String) response.getBody().get("access_token");
                
                logger.info("Exchange successful. Processing ID Token...");
                
                // 4. Gọi lại hàm verify cũ để lấy thông tin user
                return processGoogleIdToken(idTokenString); 
            } else {
                throw new RuntimeException("Failed to exchange code for token");
            }

        } catch (Exception e) {
            logger.error("Google Code Exchange Failed: {}", e.getMessage());
            throw new RuntimeException("Google Code Exchange Failed: " + e.getMessage());
        }
    }

    // --- XỬ LÝ GOOGLE ID TOKEN (Đổi tên từ processGoogleLogin) ---
    // Hàm này dùng để Verify cái token String
    public User processGoogleIdToken(String idTokenString) {
        try {
            // Verify Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(java.util.Arrays.asList(allowedClientIds))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");

                logger.debug("Google token verified: email={}", email);

                return saveOrUpdateUser(email, name, pictureUrl, "GOOGLE");
            } else {
                logger.warn("Google ID Token verification failed");
                throw new RuntimeException("Invalid Google ID token.");
            }
        } catch (Exception e) {
            logger.error("Google Authentication error: {}", e.getMessage(), e);
            throw new RuntimeException("Google Authentication Failed: " + e.getMessage());
        }
    }
    
    // Giữ lại tên hàm cũ để tương thích ngược nếu cần, nhưng trỏ vào hàm mới
    public User processGoogleLogin(String tokenOrCode) {
        // Nếu chuỗi ngắn (< 256 ký tự) thường là Auth Code, dài là ID Token (JWT)
        // Đây là cách nhận biết đơn giản
        if (tokenOrCode.length() < 256 && !tokenOrCode.contains(".")) {
             return processGoogleCode(tokenOrCode);
        } else {
             return processGoogleIdToken(tokenOrCode);
        }
    }

    // --- XỬ LÝ FACEBOOK (Giữ nguyên) ---
    public User processFacebookLogin(String accessToken) {
        try {
            String facebookGraphUrl = "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=" + accessToken;
            Map<String, Object> response = restTemplate.getForObject(facebookGraphUrl, Map.class);

            if (response == null || response.get("id") == null) {
                throw new RuntimeException("Invalid Facebook Access Token");
            }

            String email = (String) response.get("email");
            String name = (String) response.get("name");
            
            String pictureUrl = "";
            try {
                Map<String, Object> picture = (Map<String, Object>) response.get("picture");
                Map<String, Object> data = (Map<String, Object>) picture.get("data");
                pictureUrl = (String) data.get("url");
            } catch (Exception ignored) {}

            // QUAN TRỌNG: Nếu không lấy được email (do chưa cấp quyền), dùng ID làm email giả
            if (email == null) {
                email = response.get("id") + "@facebook.com";
            }

            return saveOrUpdateUser(email, name, pictureUrl, "FACEBOOK");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Facebook Authentication Failed: " + e.getMessage());
        }
    }

    private User saveOrUpdateUser(String email, String fullName, String avatarUrl, String provider) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Có thể cập nhật avatar tại đây
            return userRepository.save(user);
        } else {
            User newUser = User.builder()
                    .email(email)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .passwordHash("") 
                    .points(0)
                    .defaultLocation("")
                    .build();
            return userRepository.save(newUser);
        }
    }
}