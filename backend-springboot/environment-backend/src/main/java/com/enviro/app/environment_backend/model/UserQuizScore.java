package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_quiz_scores",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "quiz_id"}))
public class UserQuizScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private Integer score; // Số câu đúng

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @CreationTimestamp
    @Column(name = "completed_at", nullable = false, updatable = false)
    private OffsetDateTime completedAt;
}

