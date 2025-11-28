package com.enviro.app.environment_backend.service;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // [CẬP NHẬT QUAN TRỌNG] Danh sách Model Mới nhất 2025
    // Google đã thay đổi alias, cần dùng tên phiên bản cụ thể để tránh lỗi 404
    private final String[] MODEL_CANDIDATES = {
        "gemini-2.5-flash",      // Model mới nhất, nhanh nhất hiện nay
        "gemini-2.0-flash",      // Bản ổn định trước đó
        "gemini-1.5-flash-002",  // Bản 1.5 ổn định (không dùng alias 'latest' nữa)
        "gemini-1.5-pro-002"     // Bản Pro ổn định
    };

    public String callGemini(String prompt) {
        return callGeminiInternal(prompt, null);
    }

    public String callGeminiWithImage(String prompt, MultipartFile imageFile) {
        return callGeminiInternal(prompt, imageFile);
    }

    private String callGeminiInternal(String prompt, MultipartFile imageFile) {
        for (String modelName : MODEL_CANDIDATES) {
            try {
                String response = tryCallModel(modelName, prompt, imageFile);
                if (response != null) {
                    System.out.println(">>> Gemini API: Thành công với model " + modelName);
                    return response;
                }
            } catch (HttpClientErrorException e) {
                // In lỗi chi tiết để debug
                System.err.println("!!! Lỗi model " + modelName + ": " + e.getStatusCode());
                // Nếu lỗi 404 (Model không tồn tại) -> Thử model tiếp theo
                // Nếu lỗi 403 (Quyền truy cập/Key sai) -> Dừng lại ngay
                if (e.getStatusCode().value() == 403) {
                    return "Lỗi xác thực API Key (403). Vui lòng kiểm tra lại Key.";
                }
            } catch (Exception e) {
                System.err.println("!!! Lỗi hệ thống: " + e.getMessage());
            }
        }
        return "Xin lỗi, hệ thống AI đang bảo trì hoặc quá tải (Không tìm thấy model phù hợp).";
    }

    private String tryCallModel(String modelName, String prompt, MultipartFile imageFile) {
        // URL API chuẩn v1beta
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        GeminiRequest request = new GeminiRequest();
        List<Content> contents = new ArrayList<>();
        List<Part> parts = new ArrayList<>();

        // Thêm Prompt
        parts.add(new Part(prompt));

        // Thêm Ảnh (nếu có)
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
                // Tự động nhận diện mime type (mặc định jpeg nếu lỗi)
                String mimeType = imageFile.getContentType();
                if (mimeType == null || mimeType.equals("application/octet-stream")) {
                    mimeType = "image/jpeg";
                }
                parts.add(new Part(new InlineData(mimeType, base64Image)));
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }

        contents.add(new Content(parts));
        request.setContents(contents);

        // Gọi API
        GeminiResponse response = restTemplate.postForObject(url, request, GeminiResponse.class);

        if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
            return response.getCandidates().get(0).getContent().getParts().get(0).getText();
        }
        return null;
    }

    // --- DTO Classes ---
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