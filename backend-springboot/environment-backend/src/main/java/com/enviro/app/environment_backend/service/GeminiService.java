// File: src/main/java/com/enviro/app/environment_backend/service/GeminiService.java
package com.enviro.app.environment_backend.service;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String callGemini(String prompt) {
        try {
            String url = apiUrl + "?key=" + apiKey;

            // Tạo Request Body theo chuẩn Gemini API
            GeminiRequest request = new GeminiRequest();
            request.setContents(Collections.singletonList(
                    new Content(Collections.singletonList(
                            new Part(prompt)
                    ))
            ));

            // Gọi API
            GeminiResponse response = restTemplate.postForObject(url, request, GeminiResponse.class);

            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                return response.getCandidates().get(0).getContent().getParts().get(0).getText();
            }
            return "Xin lỗi, tôi không thể kết nối với AI lúc này.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi hệ thống AI: " + e.getMessage();
        }
    }

    // --- Các Class nội bộ để map JSON Request/Response ---
    @Data @NoArgsConstructor
    public static class GeminiRequest { private List<Content> contents; }
    
    @Data @NoArgsConstructor
    public static class Content { 
        private List<Part> parts;
        public Content(List<Part> parts) { this.parts = parts; }
    }
    
    @Data @NoArgsConstructor
    public static class Part { 
        private String text;
        public Part(String text) { this.text = text; }
    }

    @Data @NoArgsConstructor
    public static class GeminiResponse { private List<Candidate> candidates; }
    
    @Data @NoArgsConstructor
    public static class Candidate { private Content content; }
}