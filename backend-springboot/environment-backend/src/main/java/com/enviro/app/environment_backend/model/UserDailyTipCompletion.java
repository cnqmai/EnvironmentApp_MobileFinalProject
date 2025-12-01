package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
// ĐÃ XÓA uniqueConstraints ĐỂ CHO PHÉP HOÀN THÀNH NHIỀU LẦN
@Table(name = "user_daily_tip_completions") 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDailyTipCompletion {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_tip_id", nullable = false)
    private DailyTip dailyTip;

    @Column(name = "completed_at", columnDefinition = "TIMESTAMPTZ", nullable = false)
    private OffsetDateTime completedAt;
}