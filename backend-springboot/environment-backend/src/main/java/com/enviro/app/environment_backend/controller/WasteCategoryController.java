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

    @GetMapping
    public ResponseEntity<List<WasteCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.findAllCategories());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<WasteCategory>> searchCategories(@RequestParam String keyword) {
        return ResponseEntity.ok(categoryService.searchCategories(keyword));
    }

    @PostMapping("/classify/text")
    public ResponseEntity<WasteCategory> classifyByText(@RequestParam String description) {
        WasteCategory category = categoryService.classifyWasteByText(description);
        return category != null ? ResponseEntity.ok(category) : ResponseEntity.notFound().build();
    }

    // API nhận ảnh từ Camera/Thư viện
    @PostMapping(value = "/classify/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<WasteCategory> classifyByImage(@RequestParam("image") MultipartFile image) {
        WasteCategory category = categoryService.classifyWasteByImage(image);
        return category != null ? ResponseEntity.ok(category) : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<WasteCategory> getCategoryById(@PathVariable Long id) {
        return categoryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}