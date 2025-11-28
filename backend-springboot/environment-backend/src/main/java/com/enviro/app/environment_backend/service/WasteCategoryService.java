// File: src/main/java/com/enviro/app/environment_backend/service/WasteCategoryService.java
package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.WasteCategory;
import com.enviro.app.environment_backend.repository.WasteCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class WasteCategoryService {

    private final WasteCategoryRepository categoryRepository;
    private final GeminiService geminiService; // [MỚI]

    public WasteCategoryService(WasteCategoryRepository categoryRepository, GeminiService geminiService) {
        this.categoryRepository = categoryRepository;
        this.geminiService = geminiService;
    }

    // [MỚI] AI phân loại rác thông minh
    public WasteCategory classifyWasteByText(String description) {
        // 1. Lấy danh sách tên các danh mục có trong DB để AI chọn
        List<WasteCategory> allCategories = categoryRepository.findAll();
        String categoriesList = allCategories.stream()
                .map(WasteCategory::getName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("");

        // 2. Tạo prompt (câu lệnh) cho AI
        String prompt = String.format(
            "Tôi có món rác sau: '%s'. " +
            "Hãy phân loại nó vào đúng MỘT trong các danh mục sau: [%s]. " +
            "Chỉ trả về đúng tên danh mục, không giải thích thêm. Nếu không chắc chắn, trả về 'null'.",
            description, categoriesList
        );

        // 3. Gọi AI
        String resultName = geminiService.callGemini(prompt).trim().replace("\n", "");

        // 4. Tìm trong DB dựa trên kết quả AI trả về
        return categoryRepository.findByNameIgnoreCase(resultName).orElse(null);
    }

    // Các hàm khác GIỮ NGUYÊN ...
    public List<WasteCategory> findAllCategories() { return categoryRepository.findAll(); }
    
    public List<WasteCategory> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return new ArrayList<>();
        return categoryRepository.searchByKeyword(keyword.trim());
    }

    public Optional<WasteCategory> findById(Long id) { return categoryRepository.findById(id); }
    
    public Optional<WasteCategory> findByName(String name) { return categoryRepository.findByNameIgnoreCase(name); }

    public WasteCategory classifyWasteByImage(MultipartFile image) {
        // Ảnh phức tạp hơn, tạm thời trả về null hoặc tích hợp Gemini Vision sau
        return null; 
    }
}