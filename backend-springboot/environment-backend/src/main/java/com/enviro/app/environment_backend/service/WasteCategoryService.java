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

    public WasteCategoryService(WasteCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<WasteCategory> findAllCategories() {
        return categoryRepository.findAll();
    }

    // Tìm kiếm theo từ khóa
    public List<WasteCategory> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return categoryRepository.searchByKeyword(keyword.trim());
    }

    // Tìm theo ID
    public Optional<WasteCategory> findById(Long id) {
        return categoryRepository.findById(id);
    }

    // [MỚI] Tìm theo Tên
    public Optional<WasteCategory> findByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name);
    }

    // Giả lập AI phân loại rác qua văn bản
    public WasteCategory classifyWasteByText(String description) {
        String descLower = description.toLowerCase();
        
        // Logic đơn giản để demo (Bạn có thể mở rộng thêm)
        if (descLower.contains("chai") || descLower.contains("nhựa") || descLower.contains("túi nilon")) {
            return categoryRepository.findByNameIgnoreCase("Rác thải nhựa").orElse(null);
        } else if (descLower.contains("vỏ chuối") || descLower.contains("cơm") || descLower.contains("thức ăn")) {
            return categoryRepository.findByNameIgnoreCase("Rác hữu cơ").orElse(null);
        } else if (descLower.contains("pin") || descLower.contains("điện thoại")) {
            return categoryRepository.findByNameIgnoreCase("Rác thải điện tử").orElse(null);
        } else if (descLower.contains("giấy") || descLower.contains("bìa")) {
            return categoryRepository.findByNameIgnoreCase("Giấy").orElse(null);
        } else if (descLower.contains("lon") || descLower.contains("kim loại")) {
            return categoryRepository.findByNameIgnoreCase("Kim loại").orElse(null);
        }

        return null;
    }

    // Giả lập AI phân loại rác qua hình ảnh
    public WasteCategory classifyWasteByImage(MultipartFile image) {
        // TODO: Tích hợp AI thật ở đây
        return null; 
    }
}