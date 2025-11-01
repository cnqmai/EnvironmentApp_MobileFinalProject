package com.enviro.app.environment_backend.dto;

import com.enviro.app.environment_backend.model.ArticleType;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class ArticleResponse {
    UUID id;
    String title;
    String content;
    ArticleType type;
    String thumbnailUrl;
    String videoUrl;
    String authorName;
    String category;
    Integer viewCount;
    OffsetDateTime createdAt;
}

