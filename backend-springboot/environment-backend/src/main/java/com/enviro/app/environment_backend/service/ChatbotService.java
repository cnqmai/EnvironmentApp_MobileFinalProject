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
import org.springframework.web.client.RestTemplate;

import com.enviro.app.environment_backend.dto.ChatbotRequest;
import com.enviro.app.environment_backend.dto.ChatbotResponse;
import com.enviro.app.environment_backend.model.ChatbotHistory;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.ChatbotHistoryRepository;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Service xử lý logic Chatbot AI tích hợp Google Gemini
 */
@Service
public class ChatbotService {

    private final ChatbotHistoryRepository chatbotHistoryRepository;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public ChatbotService(ChatbotHistoryRepository chatbotHistoryRepository) {
        this.chatbotHistoryRepository = chatbotHistoryRepository;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Xử lý câu hỏi từ user và trả về phản hồi từ chatbot AI
     */
    @Transactional
    public ChatbotResponse processMessage(User user, ChatbotRequest request) {
        String userQuery = request.getMessage();
        String botResponse;

        try {
            botResponse = callGeminiAI(userQuery);
        } catch (Exception e) {
            e.printStackTrace();
            botResponse = "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối với bộ não AI. Vui lòng thử lại sau.";
        }

        // Lưu vào lịch sử
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
     * Gọi API Google Gemini để lấy câu trả lời
     */
    private String callGeminiAI(String text) {
        // Tạo URL với API Key
        String url = geminiApiUrl + "?key=" + geminiApiKey;

        // Tạo headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Tạo body request theo format của Gemini API
        // Cấu trúc JSON: { "contents": [{ "parts": [{ "text": "câu hỏi" }] }] }
        GeminiRequest requestBody = new GeminiRequest(
            Collections.singletonList(new GeminiContent(
                Collections.singletonList(new GeminiPart(text))
            ))
        );

        HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);

        // Gửi request POST
        ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(url, entity, GeminiResponse.class);

        // Xử lý response để lấy text trả về
        if (response.getBody() != null && !response.getBody().getCandidates().isEmpty()) {
            return response.getBody().getCandidates().get(0).getContent().getParts().get(0).getText();
        }
        
        return "Tôi không hiểu câu hỏi của bạn.";
    }

    /**
     * Lấy lịch sử chat của user
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

    // --- Các class DTO nội bộ để map JSON của Gemini API ---

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class GeminiRequest {
        private List<GeminiContent> contents;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class GeminiContent {
        private List<GeminiPart> parts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class GeminiPart {
        private String text;
    }

    @Data
    @NoArgsConstructor
    private static class GeminiResponse {
        private List<GeminiCandidate> candidates;
    }

    @Data
    @NoArgsConstructor
    private static class GeminiCandidate {
        private GeminiContent content;
    }
}