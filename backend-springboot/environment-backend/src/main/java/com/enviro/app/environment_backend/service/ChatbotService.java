package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.ChatbotResponse;
import com.enviro.app.environment_backend.model.ChatbotHistory;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.ChatbotHistoryRepository;
import com.enviro.app.environment_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ChatbotService {

    private final ChatbotHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public ChatbotService(ChatbotHistoryRepository historyRepository, UserRepository userRepository, RestTemplate restTemplate) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    public ChatbotResponse processChat(UUID userId, String userMessage) {
        // 1. Gọi Google Gemini API để lấy câu trả lời
        String botReply = callGeminiAi(userMessage);

        // 2. Lưu lịch sử chat vào Database
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            ChatbotHistory history = ChatbotHistory.builder()
                    .user(user)
                    .userMessage(userMessage)
                    .botResponse(botReply)
                    .build();
            historyRepository.save(history);
        }

        // 3. Trả về kết quả
        return new ChatbotResponse(botReply);
    }

    private String callGeminiAi(String prompt) {
        try {
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            // Cấu trúc Request Body theo chuẩn của Gemini API
            Map<String, Object> content = new HashMap<>();
            Map<String, String> parts = new HashMap<>();
            parts.put("text", "Bạn là một trợ lý ảo về môi trường xanh. Hãy trả lời ngắn gọn và hữu ích câu hỏi sau: " + prompt);
            
            content.put("parts", Collections.singletonList(parts));
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            // Parse Response để lấy text trả lời
            if (response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> contentRes = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> partsRes = (List<Map<String, Object>>) contentRes.get("parts");
                    if (partsRes != null && !partsRes.isEmpty()) {
                        return (String) partsRes.get(0).get("text");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, hiện tại tôi không thể kết nối với hệ thống AI. Vui lòng thử lại sau.";
        }
        return "Tôi không hiểu câu hỏi của bạn.";
    }
    
    // Lấy lịch sử chat
    public List<ChatbotHistory> getUserHistory(UUID userId) {
        return historyRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}