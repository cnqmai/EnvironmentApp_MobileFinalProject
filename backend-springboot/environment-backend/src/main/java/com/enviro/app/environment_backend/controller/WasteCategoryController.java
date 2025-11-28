package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.model.WasteCategory;
import com.enviro.app.environment_backend.service.WasteCategoryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class WasteCategoryController {

    private final WasteCategoryService categoryService;

    public WasteCategoryController(WasteCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Lấy tất cả danh mục
    @GetMapping
    public ResponseEntity<List<WasteCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.findAllCategories());
    }
    
    // Tìm kiếm danh mục
    @GetMapping("/search")
    public ResponseEntity<List<WasteCategory>> searchCategories(@RequestParam String keyword) {
        return ResponseEntity.ok(categoryService.searchCategories(keyword));
    }

    // Phân loại bằng văn bản
    @PostMapping("/classify/text")
    public ResponseEntity<WasteCategory> classifyByText(@RequestParam String description) {
        WasteCategory category = categoryService.classifyWasteByText(description);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }

    // Phân loại bằng hình ảnh
    @PostMapping(value = "/classify/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<WasteCategory> classifyByImage(@RequestParam("image") MultipartFile image) {
        WasteCategory category = categoryService.classifyWasteByImage(image);
        if (category == null) {
             return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }
    
    // [ĐÃ SỬA] Lấy chi tiết category theo ID hoặc Tên
    @GetMapping("/{idOrName}")
    public ResponseEntity<WasteCategory> getCategoryByIdOrName(@PathVariable String idOrName) {
        // 1. Thử tìm theo ID (số)
        try {
            Long id = Long.parseLong(idOrName);
            return categoryService.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            // 2. Nếu không phải số, tìm theo Tên (chuỗi)
            return categoryService.findByName(idOrName)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
    }
}