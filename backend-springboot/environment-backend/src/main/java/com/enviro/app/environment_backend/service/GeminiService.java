package com.enviro.app.environment_backend.service;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    // URL gốc (không kèm tên model)
    private final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final RestTemplate restTemplate = new RestTemplate();

    public String callGemini(String prompt) {
        return callGeminiInternal(prompt, null);
    }

    public String callGeminiWithImage(String prompt, MultipartFile imageFile) {
        return callGeminiInternal(prompt, imageFile);
    }

   private String callGeminiInternal(String prompt, MultipartFile imageFile) {
        try {
            // [CẬP NHẬT] Sử dụng 'gemini-1.5-flash' cho cả Text và Ảnh (nhanh & rẻ/free)
            // Hoặc 'gemini-1.5-pro' nếu muốn thông minh hơn (nhưng chậm hơn)
            String modelName = "gemini-1.5-flash"; 
            
            // API URL chuẩn
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
            
            GeminiRequest request = new GeminiRequest();
            List<Content> contents = new ArrayList<>();
            List<Part> parts = new ArrayList<>();

            // Thêm Prompt
            parts.add(new Part(prompt));

            // Thêm Ảnh (nếu có)
            if (imageFile != null && !imageFile.isEmpty()) {
                String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
                // Mặc định là image/jpeg
                String mimeType = imageFile.getContentType() != null ? imageFile.getContentType() : "image/jpeg";
                parts.add(new Part(new InlineData(mimeType, base64Image)));
            }

            contents.add(new Content(parts));
            request.setContents(contents);

            // Gọi API
            GeminiResponse response = restTemplate.postForObject(url, request, GeminiResponse.class);

            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                return response.getCandidates().get(0).getContent().getParts().get(0).getText();
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace(); // Xem log lỗi chi tiết nếu có
            return null;
        }
    }
    // --- DTO ---
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
        private InlineData inline_data;
        public Part(String text) { this.text = text; }
        public Part(InlineData inline_data) { this.inline_data = inline_data; }
    }
    @Data @NoArgsConstructor
    public static class InlineData {
        private String mime_type;
        private String data;
        public InlineData(String mime_type, String data) {
            this.mime_type = mime_type;
            this.data = data;
        }
    }
    @Data @NoArgsConstructor
    public static class GeminiResponse { private List<Candidate> candidates; }
    @Data @NoArgsConstructor
    public static class Candidate { private Content content; }
}