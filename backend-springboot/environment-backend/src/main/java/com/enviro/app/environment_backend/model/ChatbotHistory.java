package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "chatbot_history")
public class ChatbotHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_query", nullable = false, columnDefinition = "TEXT")
    private String userQuery;

    @Column(name = "bot_response", nullable = false, columnDefinition = "TEXT")
    private String botResponse;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Explicit constructors and getters to avoid Lombok dependency in IDE
    public ChatbotHistory() {}

    public ChatbotHistory(UUID id, User user, String userQuery, String botResponse, OffsetDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.userQuery = userQuery;
        this.botResponse = botResponse;
        this.createdAt = createdAt;
    }

    public ChatbotHistory(User user, String userQuery, String botResponse) {
        this.user = user;
        this.userQuery = userQuery;
        this.botResponse = botResponse;
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public String getUserQuery() { return userQuery; }
    public String getBotResponse() { return botResponse; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setUser(User user) { this.user = user; }
    public void setUserQuery(String userQuery) { this.userQuery = userQuery; }
    public void setBotResponse(String botResponse) { this.botResponse = botResponse; }
}

