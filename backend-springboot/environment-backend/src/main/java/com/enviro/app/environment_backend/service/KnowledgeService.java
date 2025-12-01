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
import java.util.stream.Stream;

@Service
public class KnowledgeService {

    private final KnowledgeArticleRepository repository;

    public KnowledgeService(KnowledgeArticleRepository repository) {
        this.repository = repository;
    }

    /**
     * Hàm xử lý logic lọc và tìm kiếm trung tâm
     */
    public List<ArticleResponse> getArticles(String category, ArticleType type, String search) {
        List<KnowledgeArticle> articles;

        // 1. Ưu tiên tìm kiếm theo từ khóa trước (nếu có)
        if (search != null && !search.trim().isEmpty()) {
            articles = repository.findByTitleContainingIgnoreCaseAndIsPublishedTrueOrderByCreatedAtDesc(search.trim());
        } else {
            // Nếu không tìm kiếm, lấy tất cả bài đã xuất bản
            articles = repository.findByIsPublishedTrueOrderByCreatedAtDesc();
        }

        // 2. Lọc tiếp theo Category (nếu có) bằng Java Stream (để hỗ trợ kết hợp nhiều bộ lọc)
        Stream<KnowledgeArticle> stream = articles.stream();

        if (category != null && !category.trim().isEmpty()) {
            stream = stream.filter(a -> category.equals(a.getCategory()));
        }

        // 3. Lọc tiếp theo Type (nếu có)
        if (type != null) {
            stream = stream.filter(a -> type.equals(a.getType()));
        }

        // 4. Map sang DTO và trả về list
        return stream.map(this::mapToResponse)
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
}