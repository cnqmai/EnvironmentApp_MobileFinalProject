// File: .../service/ChatbotService.java
package com.enviro.app.environment_backend.service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.enviro.app.environment_backend.dto.ChatbotRequest;
import com.enviro.app.environment_backend.dto.ChatbotResponse;
import com.enviro.app.environment_backend.model.ChatbotHistory;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.ChatbotHistoryRepository;

@Service
public class ChatbotService {

    private final ChatbotHistoryRepository chatbotHistoryRepository;

    public ChatbotService(ChatbotHistoryRepository chatbotHistoryRepository) {
        this.chatbotHistoryRepository = chatbotHistoryRepository;
    }

    @Transactional
    public ChatbotResponse processMessage(User user, ChatbotRequest request) {
        String userQuery = request.getMessage();
        // Nếu không có sessionId (Chat mới), tự tạo UUID mới
        String sessionId = (request.getSessionId() == null || request.getSessionId().isEmpty()) 
                            ? UUID.randomUUID().toString() 
                            : request.getSessionId();

        String botResponse = generateBotResponse(userQuery);

        ChatbotHistory history = new ChatbotHistory(user, sessionId, userQuery, botResponse);
        ChatbotHistory saved = chatbotHistoryRepository.save(history);

        return new ChatbotResponse(saved.getId(), saved.getSessionId(), saved.getUserQuery(), saved.getBotResponse(), saved.getCreatedAt());
    }

    // Logic giả lập AI (Giữ nguyên hoặc tùy chỉnh)
    private String generateBotResponse(String userQuery) {
        String q = userQuery.toLowerCase();
        if (q.contains("xin chào")) return "Chào bạn! Tôi có thể giúp gì?";
        if (q.contains("rác")) return "Hãy phân loại rác: Hữu cơ, Tái chế và Còn lại.";
        if (q.contains("aqi")) return "Chỉ số AQI thể hiện chất lượng không khí.";
        return "Tôi ghi nhận câu hỏi: " + userQuery;
    }

    /**
     * [QUAN TRỌNG] Lấy danh sách hội thoại (Mỗi session chỉ lấy tin nhắn mới nhất làm đại diện)
     */
    public List<ChatbotResponse> getChatSessions(User user) {
        List<ChatbotHistory> allHistory = chatbotHistoryRepository.findByUserOrderByCreatedAtDesc(user);

        // Map để lọc trùng sessionId, chỉ giữ lại tin nhắn mới nhất của mỗi session
        Map<String, ChatbotHistory> uniqueSessions = new LinkedHashMap<>();
        
        for (ChatbotHistory h : allHistory) {
            if (h.getSessionId() != null && !uniqueSessions.containsKey(h.getSessionId())) {
                uniqueSessions.put(h.getSessionId(), h);
            }
        }

        return uniqueSessions.values().stream()
                .map(h -> new ChatbotResponse(h.getId(), h.getSessionId(), h.getUserQuery(), h.getBotResponse(), h.getCreatedAt()))
                .collect(Collectors.toList());
    }

    /**
     * [MỚI] Lấy chi tiết tin nhắn trong 1 hội thoại
     */
    public List<ChatbotResponse> getSessionMessages(String sessionId) {
        return chatbotHistoryRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(h -> new ChatbotResponse(h.getId(), h.getSessionId(), h.getUserQuery(), h.getBotResponse(), h.getCreatedAt()))
                .collect(Collectors.toList());
    }

    /**
     * [MỚI] Xóa hội thoại
     */
    @Transactional
    public void deleteSession(String sessionId, User user) {
        // Cần check quyền sở hữu (ở đây làm đơn giản)
        chatbotHistoryRepository.deleteBySessionId(sessionId);
    }
}