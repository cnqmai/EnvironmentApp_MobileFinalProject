package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.ArticleResponse;
import com.enviro.app.environment_backend.model.ArticleType;
import com.enviro.app.environment_backend.model.KnowledgeArticle;
import com.enviro.app.environment_backend.repository.KnowledgeArticleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class KnowledgeService {

    private final KnowledgeArticleRepository repository;

    public KnowledgeService(KnowledgeArticleRepository repository) {
        this.repository = repository;
    }
    
    public List<ArticleResponse> getAllArticles() {
        List<KnowledgeArticle> articles = repository.findByIsPublishedTrueOrderByCreatedAtDesc();
        return articles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ArticleResponse getArticleById(UUID id) {
        KnowledgeArticle article = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết"));
        
        if (!article.getIsPublished()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bài viết không được công bố");
        }

        // Tăng view count
        article.setViewCount(article.getViewCount() + 1);
        repository.save(article);

        return mapToResponse(article);
    }

    public List<ArticleResponse> getArticlesByCategory(String category) {
        List<KnowledgeArticle> articles = repository.findByCategoryAndIsPublishedTrueOrderByCreatedAtDesc(category);
        return articles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ArticleResponse> getArticlesByType(ArticleType type) {
        List<KnowledgeArticle> articles = repository.findByTypeAndIsPublishedTrueOrderByCreatedAtDesc(type);
        return articles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ArticleResponse mapToResponse(KnowledgeArticle article) {
        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .content(article.getContent())
                .type(article.getType())
                .thumbnailUrl(article.getThumbnailUrl())
                .videoUrl(article.getVideoUrl())
                .authorName(article.getAuthorName())
                .category(article.getCategory())
                .viewCount(article.getViewCount())
                .createdAt(article.getCreatedAt())
                .build();
    }
    // ... các method cũ giữ nguyên ...

    // [MỚI] Hàm tìm kiếm bài viết
    public List<ArticleResponse> searchArticles(String keyword) {
        List<KnowledgeArticle> articles = repository.findByTitleContainingIgnoreCaseAndIsPublishedTrueOrderByCreatedAtDesc(keyword);
        return articles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}

