package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.FacebookUser; // THÊM MỚI
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate; // THÊM MỚI
import org.springframework.web.util.UriComponentsBuilder; // THÊM MỚI

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class OAuth2Service {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleIdTokenVerifier googleVerifier;
    private final RestTemplate restTemplate; // THÊM MỚI
    private final String facebookUserInfoUri; // THÊM MỚI

    public OAuth2Service(@Value("${spring.security.oauth2.client.registration.google.client-id}") String googleClientId,
                         @Value("${facebook.api.user-info-uri}") String facebookUserInfoUri, // THÊM MỚI
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleVerifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
        this.restTemplate = new RestTemplate(); // THÊM MỚI
        this.facebookUserInfoUri = facebookUserInfoUri; // THÊM MỚI
    }

    @Transactional
    public User processGoogleLogin(String idTokenString) throws GeneralSecurityException, IOException {
        GoogleIdToken idToken = googleVerifier.verify(idTokenString);
        if (idToken == null) {
            throw new IllegalArgumentException("ID Token không hợp lệ.");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String fullName = (String) payload.get("name");
        String avatarUrl = (String) payload.get("picture");

        return findOrCreateUser(email, fullName, avatarUrl);
    }

    /**
     * THÊM MỚI: Xử lý đăng nhập bằng Facebook
     */
    @Transactional
    public User processFacebookLogin(String accessToken) {
        String url = UriComponentsBuilder.fromUriString(facebookUserInfoUri)
                .queryParam("access_token", accessToken)
                .toUriString();

        FacebookUser facebookUser = restTemplate.getForObject(url, FacebookUser.class);

        if (facebookUser == null || facebookUser.getEmail() == null) {
            throw new IllegalArgumentException("Không thể lấy thông tin người dùng từ Facebook.");
        }

        String email = facebookUser.getEmail();
        String fullName = facebookUser.getName();
        String avatarUrl = (facebookUser.getPicture() != null && facebookUser.getPicture().getData() != null)
                ? facebookUser.getPicture().getData().getUrl()
                : "";

        return findOrCreateUser(email, fullName, avatarUrl);
    }
    
    /**
     * THÊM MỚI: Tách logic tìm hoặc tạo User ra hàm riêng để tái sử dụng
     */
    private User findOrCreateUser(String email, String fullName, String avatarUrl) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            User newUser = User.builder()
                    .email(email)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .points(0)
                    .defaultLocation("")
                    .build();
            return userRepository.save(newUser);
        }
    }
}