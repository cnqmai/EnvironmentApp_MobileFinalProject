package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.model.WasteCategory;
import com.enviro.app.environment_backend.service.WasteCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class WasteCategoryController {

    private final WasteCategoryService categoryService;

    public WasteCategoryController(WasteCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * API Lấy tất cả Danh mục Rác (Public)
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<List<WasteCategory>> getAllCategories() {
        List<WasteCategory> categories = categoryService.findAllCategories();
        return ResponseEntity.ok(categories);
    }
}