package com.enviro.app.environment_backend.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.enviro.app.environment_backend.dto.ChatbotRequest;
import com.enviro.app.environment_backend.dto.ChatbotResponse;
import com.enviro.app.environment_backend.model.ChatbotHistory;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.ChatbotHistoryRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Service xử lý logic Chatbot AI tích hợp Google Gemini
 */
@Service
public class ChatbotService {

    private final ChatbotHistoryRepository chatbotHistoryRepository;
    private final RestTemplate restTemplate;

    // Lấy API Key từ file application.properties
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // CẬP NHẬT QUAN TRỌNG: Sử dụng model 'gemini-2.5-flash' thay vì 'gemini-1.5-flash' (đã bị khai tử)
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    public ChatbotService(ChatbotHistoryRepository chatbotHistoryRepository) {
        this.chatbotHistoryRepository = chatbotHistoryRepository;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Xử lý tin nhắn từ user
     */
    @Transactional
    public ChatbotResponse processMessage(User user, ChatbotRequest request) {
        String userQuery = request.getMessage();
        
        // Gọi Gemini AI để lấy câu trả lời
        String botResponse = callGeminiAI(userQuery);

        // Lưu lịch sử chat vào database
        ChatbotHistory history = new ChatbotHistory(user, userQuery, botResponse);
        ChatbotHistory savedHistory = chatbotHistoryRepository.save(history);

        return new ChatbotResponse(
                savedHistory.getId(),
                savedHistory.getUserQuery(),
                savedHistory.getBotResponse(),
                savedHistory.getCreatedAt()
        );
    }

    /**
     * Hàm gọi trực tiếp đến Google Gemini API
     */
    private String callGeminiAI(String text) {
        try {
            String url = GEMINI_API_URL + geminiApiKey;

            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Tạo body request đúng chuẩn Google Gemini
            GeminiPart part = new GeminiPart(text);
            GeminiContent content = new GeminiContent(Collections.singletonList(part));
            GeminiRequest requestBody = new GeminiRequest(Collections.singletonList(content));

            HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);

            // Gửi request POST
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(url, entity, GeminiResponse.class);

            // Xử lý response trả về
            if (response.getBody() != null && 
                response.getBody().candidates != null && 
                !response.getBody().candidates.isEmpty()) {
                
                GeminiCandidate candidate = response.getBody().candidates.get(0);
                if (candidate.content != null && 
                    candidate.content.parts != null && 
                    !candidate.content.parts.isEmpty()) {
                    return candidate.content.parts.get(0).text;
                }
            }
            
            return "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.";

        } catch (HttpClientErrorException e) {
            e.printStackTrace();
            // Trả về thông báo lỗi chi tiết để dễ debug hơn trên App
            return "Lỗi kết nối AI: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
        } catch (Exception e) {
            e.printStackTrace();
            return "Đã xảy ra lỗi hệ thống khi xử lý tin nhắn.";
        }
    }

    /**
     * Lấy lịch sử chat
     */
    public List<ChatbotResponse> getChatHistory(User user) {
        List<ChatbotHistory> historyList = chatbotHistoryRepository.findByUserOrderByCreatedAtDesc(user);
        return historyList.stream()
                .map(h -> new ChatbotResponse(
                        h.getId(),
                        h.getUserQuery(),
                        h.getBotResponse(),
                        h.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // ==========================================
    // Các Inner Class (DTO) để map dữ liệu JSON của Gemini
    // ==========================================

    public static class GeminiRequest {
        public List<GeminiContent> contents;
        public GeminiRequest(List<GeminiContent> contents) { this.contents = contents; }
    }

    public static class GeminiContent {
        public List<GeminiPart> parts;
        public GeminiContent() {} 
        public GeminiContent(List<GeminiPart> parts) { this.parts = parts; }
    }

    public static class GeminiPart {
        public String text;
        public GeminiPart() {}
        public GeminiPart(String text) { this.text = text; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GeminiResponse {
        public List<GeminiCandidate> candidates;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GeminiCandidate {
        public GeminiContent content;
    }
}