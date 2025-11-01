package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.WasteCategory;
import com.enviro.app.environment_backend.repository.WasteCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WasteCategoryService {

    private final WasteCategoryRepository categoryRepository;

    public WasteCategoryService(WasteCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Lấy tất cả danh mục rác hiện có.
     */
    public List<WasteCategory> findAllCategories() {
        return categoryRepository.findAll();
    }
}