package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.ChatbotRequest;
import com.enviro.app.environment_backend.dto.ChatbotResponse;
import com.enviro.app.environment_backend.model.ChatbotHistory;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.ChatbotHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private final ChatbotHistoryRepository chatbotHistoryRepository;
    private final GeminiService geminiService; // Service gọi AI

    public ChatbotService(ChatbotHistoryRepository chatbotHistoryRepository, GeminiService geminiService) {
        this.chatbotHistoryRepository = chatbotHistoryRepository;
        this.geminiService = geminiService;
    }

    /**
     * Xử lý tin nhắn từ người dùng:
     * 1. Tạo session ID nếu chưa có.
     * 2. Gọi Google Gemini để lấy câu trả lời thông minh.
     * 3. Lưu vào database.
     */
    @Transactional
    public ChatbotResponse processMessage(User user, ChatbotRequest request) {
        String userQuery = request.getMessage();
        
        // Nếu client không gửi sessionId (chat mới), tự tạo UUID mới
        String sessionId = (request.getSessionId() == null || request.getSessionId().isEmpty()) 
                            ? UUID.randomUUID().toString() 
                            : request.getSessionId();

        // [QUAN TRỌNG] Gọi AI thay vì dùng if-else cứng nhắc
        String botResponse = geminiService.callGemini(
            "Bạn là trợ lý môi trường Enviminds. Hãy trả lời ngắn gọn, thân thiện (dưới 200 từ) câu hỏi sau: " + userQuery
        );

        // Lưu lịch sử
        ChatbotHistory history = new ChatbotHistory(user, sessionId, userQuery, botResponse);
        ChatbotHistory saved = chatbotHistoryRepository.save(history);

        // Trả về kết quả
        return new ChatbotResponse(
            saved.getId(), 
            saved.getSessionId(), 
            saved.getUserQuery(), 
            saved.getBotResponse(), 
            saved.getCreatedAt()
        );
    }

    /**
     * Lấy danh sách các cuộc hội thoại (Sessions).
     * Logic: Chỉ lấy tin nhắn mới nhất của mỗi session để hiển thị ngoài danh sách.
     */
    public List<ChatbotResponse> getChatSessions(User user) {
        // Lấy tất cả lịch sử của user, sắp xếp mới nhất lên đầu
        List<ChatbotHistory> allHistory = chatbotHistoryRepository.findByUserOrderByCreatedAtDesc(user);

        // Dùng Map để lọc trùng sessionId (chỉ giữ bản ghi đầu tiên/mới nhất gặp được)
        Map<String, ChatbotHistory> uniqueSessions = new LinkedHashMap<>();
        
        for (ChatbotHistory h : allHistory) {
            // Nếu có sessionId và chưa có trong map thì thêm vào
            if (h.getSessionId() != null && !uniqueSessions.containsKey(h.getSessionId())) {
                uniqueSessions.put(h.getSessionId(), h);
            }
        }

        // Chuyển đổi sang DTO
        return uniqueSessions.values().stream()
                .map(h -> new ChatbotResponse(
                    h.getId(), 
                    h.getSessionId(), 
                    h.getUserQuery(), 
                    h.getBotResponse(), 
                    h.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết toàn bộ tin nhắn trong một cuộc hội thoại cụ thể.
     */
    public List<ChatbotResponse> getSessionMessages(String sessionId) {
        // Lấy list tin nhắn theo sessionId, sắp xếp cũ -> mới để hiển thị đúng thứ tự chat
        List<ChatbotHistory> sessionHistory = chatbotHistoryRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        
        return sessionHistory.stream()
                .map(h -> new ChatbotResponse(
                    h.getId(), 
                    h.getSessionId(), 
                    h.getUserQuery(), 
                    h.getBotResponse(), 
                    h.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Xóa toàn bộ cuộc hội thoại theo Session ID.
     */
    @Transactional
    public void deleteSession(String sessionId, User user) {
        // Lưu ý: Trong thực tế nên check xem sessionId này có thuộc về user không để bảo mật
        chatbotHistoryRepository.deleteBySessionId(sessionId);
    }
}