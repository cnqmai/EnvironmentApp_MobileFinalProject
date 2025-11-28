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
import java.util.stream.Collectors;

@Service
public class WasteCategoryService {

    private final WasteCategoryRepository categoryRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WasteCategoryService(WasteCategoryRepository categoryRepository, GeminiService geminiService) {
        this.categoryRepository = categoryRepository;
        this.geminiService = geminiService;
    }

    @PostConstruct
    public void initData() {
        if (categoryRepository.count() == 0) {
             List<WasteCategory> defaults = Arrays.asList(
                new WasteCategory(null, "Rác hữu cơ", "Thức ăn thừa, vỏ rau củ...", "Ủ phân (Compost) hoặc bỏ túi phân hủy.", "Tái chế thành phân bón.", "ORGANIC", null),
                new WasteCategory(null, "Rác thải nhựa", "Chai nhựa, túi nilon...", "Rửa sạch, nén nhỏ.", "Tái chế hạt nhựa.", "PLASTIC", null),
                new WasteCategory(null, "Rác điện tử", "Pin, điện thoại hỏng...", "Mang đến điểm thu gom chuyên dụng.", "Thu hồi kim loại quý.", "ELECTRONIC", null),
                new WasteCategory(null, "Giấy", "Sách báo, bìa carton...", "Giữ khô ráo, xếp gọn.", "Tái chế bột giấy.", "PAPER", null),
                new WasteCategory(null, "Kim loại", "Vỏ lon, đồ hộp...", "Rửa sạch thực phẩm thừa.", "Nung chảy tái chế.", "METAL", null),
                new WasteCategory(null, "Thủy tinh", "Chai lọ, ly cốc...", "Rửa sạch, gói kỹ nếu vỡ.", "Nung chảy thổi chai mới.", "GLASS", null)
            );
            categoryRepository.saveAll(defaults);
        }
    }

    public List<WasteCategory> findAllCategories() {
        return categoryRepository.findAll();
    }

    public List<WasteCategory> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return new ArrayList<>();
        List<WasteCategory> dbResults = categoryRepository.searchByKeyword(keyword.trim());
        if (!dbResults.isEmpty()) return dbResults;

        WasteCategory aiResult = classifyWasteByText(keyword);
        if (aiResult != null && !"Không xác định".equals(aiResult.getName())) {
            return List.of(aiResult);
        }
        return new ArrayList<>();
    }

    // --- AI TEXT ---
    public WasteCategory classifyWasteByText(String description) {
        String prompt = String.format(
            "Đóng vai chuyên gia môi trường. Phân tích rác thải: '%s'. " +
            "Trả về JSON duy nhất (không markdown, không giải thích). Cấu trúc: " +
            "{\"name\": \"Tên gọi (Tiếng Việt)\", \"description\": \"Mô tả ngắn\", " +
            "\"disposalGuideline\": \"Cách xử lý/vứt bỏ\", \"recyclingGuideline\": \"Khả năng tái chế\", " +
            "\"collectionPointType\": \"Chọn 1: ORGANIC, PLASTIC, PAPER, METAL, GLASS, ELECTRONIC, HAZARDOUS, OTHER\"}", 
            description
        );
        return processAiRequest(prompt, null);
    }

    // --- AI IMAGE (NÂNG CẤP) ---
    public WasteCategory classifyWasteByImage(MultipartFile image) {
        // Prompt được tối ưu để nhận diện hình ảnh tốt hơn
        String prompt = "Hãy đóng vai một chuyên gia tái chế rác thải tại Việt Nam. " +
                        "Hãy nhìn thật kỹ vào bức ảnh này và xác định vật phẩm chính trong ảnh là gì. " +
                        "1. Nếu là rác thải: Hãy phân loại nó và đưa ra hướng dẫn xử lý chính xác. " +
                        "2. Nếu ảnh mờ, không rõ hoặc không phải rác: Hãy trả về tên là 'Không xác định'. " +
                        "QUAN TRỌNG: Chỉ trả về chuỗi JSON thuần túy (không có markdown ```json), theo định dạng sau: " +
                        "{" +
                        "  \"name\": \"Tên vật phẩm (Tiếng Việt, ngắn gọn)\", " +
                        "  \"description\": \"Mô tả tình trạng vật phẩm trong ảnh (ví dụ: Chai nhựa đã qua sử dụng)\", " +
                        "  \"disposalGuideline\": \"Hướng dẫn chi tiết cách làm sạch, phân loại và vứt bỏ đúng quy định\", " +
                        "  \"recyclingGuideline\": \"Vật này có tái chế được không? Tái chế thành gì?\", " +
                        "  \"collectionPointType\": \"Chọn CHÍNH XÁC một trong các loại sau: ORGANIC, PLASTIC, PAPER, METAL, GLASS, ELECTRONIC, HAZARDOUS, OTHER\"" +
                        "}";
        return processAiRequest(prompt, image);
    }

    private WasteCategory processAiRequest(String prompt, MultipartFile image) {
        String jsonResponse = (image != null) 
                ? geminiService.callGeminiWithImage(prompt, image) 
                : geminiService.callGemini(prompt);

        if (jsonResponse == null) return null;

        try {
            // Làm sạch chuỗi JSON triệt để hơn
            if (jsonResponse.contains("{")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("{"), jsonResponse.lastIndexOf("}") + 1);
            }
            
            WasteCategory aiCategory = objectMapper.readValue(jsonResponse, WasteCategory.class);
            aiCategory.setId(System.currentTimeMillis());
            return aiCategory;
        } catch (Exception e) {
            System.err.println("Lỗi parse JSON từ AI: " + e.getMessage());
            return null;
        }
    }
    
    public Optional<WasteCategory> findById(Long id) { return categoryRepository.findById(id); }
    public Optional<WasteCategory> findByName(String name) { return categoryRepository.findByNameIgnoreCase(name); }
}