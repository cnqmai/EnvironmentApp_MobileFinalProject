package com.enviro.app.environment_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enviro.app.environment_backend.dto.ChatbotRequest;
import com.enviro.app.environment_backend.dto.ChatbotResponse;
import com.enviro.app.environment_backend.model.ChatbotHistory;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.ChatbotHistoryRepository;

/**
 * Service xử lý logic Chatbot AI (FR-5.x)
 * 
 * LƯU Ý: Service này hiện tại chỉ trả về câu trả lời mẫu.
 * Để tích hợp AI thực sự, bạn cần:
 * 1. Tích hợp OpenAI API hoặc Google Gemini API
 * 2. Hoặc tạo một service AI riêng để xử lý
 */
@Service
public class ChatbotService {

    private final ChatbotHistoryRepository chatbotHistoryRepository;

    public ChatbotService(ChatbotHistoryRepository chatbotHistoryRepository) {
        this.chatbotHistoryRepository = chatbotHistoryRepository;
    }

    /**
     * Xử lý câu hỏi từ user và trả về phản hồi từ chatbot (FR-5.1)
     * 
     * TODO: Tích hợp với AI Service thực sự (OpenAI/Gemini)
     */
    @Transactional
    public ChatbotResponse processMessage(User user, ChatbotRequest request) {
        String userQuery = request.getMessage();
        String botResponse = generateBotResponse(userQuery);

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
     * Tạo phản hồi từ chatbot (Hiện tại chỉ là logic đơn giản)
     * TODO: Thay thế bằng AI Service thực sự
     */
    private String generateBotResponse(String userQuery) {
        String query = userQuery.toLowerCase().trim();

        // Logic đơn giản để trả lời một số câu hỏi thường gặp
        if (query.contains("phân loại rác") || query.contains("rác thải")) {
            return "Để phân loại rác đúng cách, bạn nên:\n" +
                   "1. Rác hữu cơ: Thức ăn thừa, lá cây → Ủ phân hoặc bỏ vào thùng rác hữu cơ\n" +
                   "2. Rác tái chế: Giấy, nhựa, kim loại → Bỏ vào thùng rác tái chế\n" +
                   "3. Rác nguy hại: Pin, bóng đèn, thiết bị điện tử → Mang đến điểm thu gom đặc biệt\n" +
                   "4. Rác thải khác: Không thể tái chế → Bỏ vào thùng rác thông thường";
        }

        if (query.contains("chất lượng không khí") || query.contains("aqi")) {
            return "Chỉ số AQI (Air Quality Index) đo chất lượng không khí:\n" +
                   "• 0-50: Tốt (Xanh lá) - Không khí trong lành\n" +
                   "• 51-100: Trung bình (Vàng) - Nhạy cảm nhẹ có thể gặp vấn đề\n" +
                   "• 101-150: Không tốt cho nhóm nhạy cảm (Cam) - Tránh hoạt động ngoài trời\n" +
                   "• 151-200: Không tốt (Đỏ) - Mọi người có thể gặp vấn đề sức khỏe\n" +
                   "• >200: Rất nguy hại (Tím) - Tránh tất cả hoạt động ngoài trời";
        }

        if (query.contains("bảo vệ môi trường") || query.contains("sống xanh")) {
            return "Một số cách bảo vệ môi trường bạn có thể làm:\n" +
                   "• Giảm sử dụng nhựa dùng một lần\n" +
                   "• Tái chế rác thải đúng cách\n" +
                   "• Tiết kiệm điện, nước\n" +
                   "• Sử dụng phương tiện công cộng hoặc đi bộ\n" +
                   "• Trồng cây xanh\n" +
                   "• Tham gia các hoạt động tình nguyện môi trường";
        }

        if (query.contains("luật") || query.contains("quy định")) {
            return "Các luật bảo vệ môi trường quan trọng ở Việt Nam:\n" +
                   "• Luật Bảo vệ Môi trường 2020\n" +
                   "• Nghị định về xử phạt vi phạm hành chính trong lĩnh vực môi trường\n" +
                   "• Quy định về phân loại, thu gom và xử lý rác thải\n" +
                   "Bạn có thể báo cáo vi phạm môi trường qua ứng dụng này!";
        }

        // Trả lời mặc định
        return "Xin chào! Tôi là chatbot hỗ trợ về môi trường.\n" +
               "Tôi có thể giúp bạn với:\n" +
               "• Phân loại rác thải\n" +
               "• Chất lượng không khí (AQI)\n" +
               "• Cách bảo vệ môi trường\n" +
               "• Luật và quy định môi trường\n\n" +
               "Hãy hỏi tôi bất kỳ câu hỏi nào về môi trường!";
    }

    /**
     * Lấy lịch sử chat của user (FR-1.2.3, FR-5.1)
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
}

