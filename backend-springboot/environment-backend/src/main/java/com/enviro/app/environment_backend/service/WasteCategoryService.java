package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.WasteCategory;
import com.enviro.app.environment_backend.repository.WasteCategoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class WasteCategoryService {

    private final WasteCategoryRepository categoryRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WasteCategoryService(WasteCategoryRepository categoryRepository, GeminiService geminiService) {
        this.categoryRepository = categoryRepository;
        this.geminiService = geminiService;
    }

    /**
     * Nạp dữ liệu nền tảng vào Database nếu trống.
     * Đây là các danh mục "gốc" (Categories) cần thiết để hiển thị trên màn hình chính.
     */
    @PostConstruct
    public void initData() {
        if (categoryRepository.count() == 0) {
            List<WasteCategory> baseCategories = Arrays.asList(
                new WasteCategory(null, "Rác hữu cơ", "Thức ăn thừa, vỏ rau củ...", "Ủ phân (Compost) hoặc bỏ túi phân hủy.", "Tái chế thành phân bón.", "ORGANIC", null),
                new WasteCategory(null, "Rác thải nhựa", "Chai nhựa, túi nilon...", "Rửa sạch, nén nhỏ.", "Tái chế hạt nhựa.", "PLASTIC", null),
                new WasteCategory(null, "Giấy", "Sách báo, bìa carton...", "Giữ khô ráo, xếp gọn.", "Tái chế bột giấy.", "PAPER", null),
                new WasteCategory(null, "Kim loại", "Vỏ lon, đồ hộp...", "Rửa sạch thực phẩm thừa.", "Nung chảy tái chế.", "METAL", null),
                new WasteCategory(null, "Điện tử", "Pin, điện thoại hỏng...", "Mang đến điểm thu gom chuyên dụng.", "Thu hồi kim loại quý.", "ELECTRONIC", null),
                new WasteCategory(null, "Thủy tinh", "Chai lọ, ly cốc...", "Rửa sạch, gói kỹ nếu vỡ.", "Nung chảy thổi chai mới.", "GLASS", null)
            );
            categoryRepository.saveAll(baseCategories);
        }
    }

    // Lấy danh sách danh mục gốc (từ Database)
    public List<WasteCategory> findAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * [QUAN TRỌNG] Tìm kiếm thông minh:
     * 1. Tìm trong Database trước.
     * 2. Nếu không thấy -> Hỏi AI Gemini ngay lập tức.
     */
    public List<WasteCategory> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return new ArrayList<>();

        // 1. Tìm trong Database
        List<WasteCategory> dbResults = categoryRepository.searchByKeyword(keyword.trim());
        
        // Nếu có kết quả trong DB, trả về ngay
        if (!dbResults.isEmpty()) {
            return dbResults;
        }

        // 2. Nếu DB không có -> Gọi AI phân tích (Live AI Data)
        System.out.println(">>> Không tìm thấy trong DB, đang hỏi AI về: " + keyword);
        WasteCategory aiResult = classifyWasteByText(keyword);
        
        if (aiResult != null && !"Không xác định".equals(aiResult.getName())) {
            // Trả về kết quả từ AI như một danh sách
            return List.of(aiResult);
        }

        return new ArrayList<>();
    }

    // --- LOGIC GỌI AI (Giữ nguyên logic chuẩn) ---

    public WasteCategory classifyWasteByText(String description) {
        String prompt = String.format(
            "Đóng vai chuyên gia môi trường Việt Nam. Phân tích rác thải: '%s'. " +
            "Trả về JSON duy nhất (không markdown): " +
            "{\"name\": \"Tên chính xác của vật phẩm\", \"description\": \"Mô tả ngắn gọn\", " +
            "\"disposalGuideline\": \"Hướng dẫn vứt bỏ chi tiết\", \"recyclingGuideline\": \"Khả năng tái chế\", " +
            "\"collectionPointType\": \"Chọn 1: ORGANIC, PLASTIC, PAPER, METAL, GLASS, ELECTRONIC, HAZARDOUS, OTHER\"}", 
            description
        );
        return processAiRequest(prompt, null);
    }

    public WasteCategory classifyWasteByImage(MultipartFile image) {
        String prompt = "Nhìn vào ảnh và xác định đây là rác gì. Trả về JSON duy nhất (không markdown): " +
                        "{\"name\": \"Tên vật phẩm\", \"description\": \"Mô tả\", " +
                        "\"disposalGuideline\": \"Cách xử lý\", \"recyclingGuideline\": \"Cách tái chế\", " +
                        "\"collectionPointType\": \"Chọn 1: ORGANIC, PLASTIC, PAPER, METAL, GLASS, ELECTRONIC, HAZARDOUS, OTHER\"}";
        return processAiRequest(prompt, image);
    }

    private WasteCategory processAiRequest(String prompt, MultipartFile image) {
        String jsonResponse;
        if (image != null) {
            jsonResponse = geminiService.callGeminiWithImage(prompt, image);
        } else {
            jsonResponse = geminiService.callGemini(prompt);
        }

        if (jsonResponse == null) return null;

        try {
            jsonResponse = jsonResponse.replace("```json", "").replace("```", "").trim();
            WasteCategory aiCategory = objectMapper.readValue(jsonResponse, WasteCategory.class);
            // Gán ID ngẫu nhiên để Frontend có key render
            aiCategory.setId(System.currentTimeMillis()); 
            return aiCategory;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public Optional<WasteCategory> findById(Long id) {
        return categoryRepository.findById(id);
    }
    
    public Optional<WasteCategory> findByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name);
    }
}