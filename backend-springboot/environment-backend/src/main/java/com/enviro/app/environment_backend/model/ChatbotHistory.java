package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "chatbot_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotHistory {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // --- [QUAN TRỌNG] BẠN ĐANG THIẾU TRƯỜNG NÀY ---
    @Column(name = "session_id")
    private String sessionId; 
    // ----------------------------------------------

    @Column(name = "user_query", length = 1000)
    private String userQuery;

    @Column(name = "bot_response", length = 4000)
    private String botResponse;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }
    
    // Constructor tiện ích (Cần cập nhật thêm sessionId vào đây)
    public ChatbotHistory(User user, String sessionId, String userQuery, String botResponse) {
        this.user = user;
        this.sessionId = sessionId; // Nhớ gán giá trị này
        this.userQuery = userQuery;
        this.botResponse = botResponse;
    }
}