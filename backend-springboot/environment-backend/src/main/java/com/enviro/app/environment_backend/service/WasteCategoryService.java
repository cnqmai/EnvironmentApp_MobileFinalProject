package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.WasteCategory;
import com.enviro.app.environment_backend.repository.WasteCategoryRepository;
import org.springframework.stereotype.Service;

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

    // --- THÊM MỚI ---
    public Optional<WasteCategory> findBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }
}