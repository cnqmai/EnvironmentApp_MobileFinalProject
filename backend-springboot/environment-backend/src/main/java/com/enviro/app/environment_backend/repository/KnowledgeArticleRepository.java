package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.ArticleType;
import com.enviro.app.environment_backend.model.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, UUID> {
    
    List<KnowledgeArticle> findByIsPublishedTrueOrderByCreatedAtDesc();
    
    List<KnowledgeArticle> findByCategoryAndIsPublishedTrueOrderByCreatedAtDesc(String category);
    
    List<KnowledgeArticle> findByTypeAndIsPublishedTrueOrderByCreatedAtDesc(ArticleType type);

    // [MỚI] Tìm kiếm theo tiêu đề (không phân biệt hoa thường)
    List<KnowledgeArticle> findByTitleContainingIgnoreCaseAndIsPublishedTrueOrderByCreatedAtDesc(String title);
}