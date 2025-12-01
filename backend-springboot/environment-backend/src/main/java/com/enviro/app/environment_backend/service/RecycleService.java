package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper; // Import Jackson để parse JSON
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class RecycleService {

    private final UserRepository userRepository;
    private final BadgeService badgeService;
    private final GeminiService geminiService; // [MỚI] Inject Gemini
    private final ObjectMapper objectMapper;   // [MỚI] JSON Parser

    public RecycleService(UserRepository userRepository, BadgeService badgeService, GeminiService geminiService, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.badgeService = badgeService;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    /**
     * Gửi ảnh sang Gemini AI để nhận diện rác
     */
    public Map<String, Object> identifyWaste(MultipartFile file) {
        // Prompt (Câu lệnh) gửi cho AI
        String prompt = "Bạn là chuyên gia phân loại rác. Hãy nhìn hình ảnh này và xác định vật thể chính. " +
                        "Trả về kết quả duy nhất là một JSON Object (không dùng markdown, không code block) với các trường sau: " +
                        "\"label\": (Tên vật thể tiếng Việt), " +
                        "\"type\": (Loại rác: 'Tái chế được', 'Rác hữu cơ', 'Rác thải nguy hại', hoặc 'Rác thải còn lại'), " +
                        "\"guideline\": (Hướng dẫn xử lý ngắn gọn trong 1 câu tiếng Việt), " +
                        "\"confidence\": (Độ tin cậy từ 0.0 đến 1.0).";

        // Gọi Gemini
        String jsonResponse = geminiService.callGeminiWithImage(prompt, file);

        // Xử lý chuỗi JSON trả về (AI đôi khi trả về kèm markdown ```json ... ```)
        if (jsonResponse != null) {
            jsonResponse = jsonResponse.replace("```json", "").replace("```", "").trim();
            try {
                // Convert chuỗi JSON thành Map
                return objectMapper.readValue(jsonResponse, Map.class);
            } catch (Exception e) {
                System.err.println("Lỗi parse JSON từ AI: " + e.getMessage());
            }
        }

        // Fallback nếu lỗi
        return Map.of(
            "label", "Không xác định",
            "type", "Không rõ",
            "guideline", "Hệ thống không thể nhận diện rõ hình ảnh này. Vui lòng chụp lại gần hơn.",
            "confidence", 0.0
        );
    }

    @Transactional
    public int confirmRecycle(User user, String wasteType) {
        // Cộng điểm thưởng (5 điểm)
        int pointsReward = 5;
        user.setPoints(user.getPoints() + pointsReward);
        userRepository.save(user);

        // Kiểm tra thăng cấp huy hiệu
        badgeService.checkAndAssignBadges(user);

        return user.getPoints();
    }
}