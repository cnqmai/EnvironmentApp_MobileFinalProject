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

    @GetMapping
    public ResponseEntity<List<ArticleResponse>> getAllArticles() {
        return ResponseEntity.ok(knowledgeService.getAllArticles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponse> getArticleById(@PathVariable UUID id) {
        return ResponseEntity.ok(knowledgeService.getArticleById(id));
    }

    @GetMapping(params = "category")
    public ResponseEntity<List<ArticleResponse>> getArticlesByCategory(@RequestParam String category) {
        return ResponseEntity.ok(knowledgeService.getArticlesByCategory(category));
    }

    @GetMapping(params = "type")
    public ResponseEntity<List<ArticleResponse>> getArticlesByType(@RequestParam ArticleType type) {
        return ResponseEntity.ok(knowledgeService.getArticlesByType(type));
    }
}

