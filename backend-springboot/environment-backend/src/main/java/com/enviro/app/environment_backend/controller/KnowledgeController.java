package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.ArticleResponse;
import com.enviro.app.environment_backend.model.ArticleType;
import com.enviro.app.environment_backend.service.KnowledgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    /**
     * API duy nhất để lấy danh sách bài viết.
     * Hỗ trợ lọc theo: category, type, search (từ khóa).
     * Các tham số đều là tùy chọn (required = false).
     */
    @GetMapping
    public ResponseEntity<List<ArticleResponse>> getArticles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ArticleType type,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(knowledgeService.getArticles(category, type, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponse> getArticleById(@PathVariable UUID id) {
        return ResponseEntity.ok(knowledgeService.getArticleById(id));
    }
}