package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_rewards")
public class UserReward {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_id", nullable = false)
    private Reward reward;

    @Column(name = "voucher_code")
    private String voucherCode;

    @Column(nullable = false)
    @Builder.Default
    private String status = "pending"; // 'pending', 'claimed', 'used', 'expired'

    @CreationTimestamp
    @Column(name = "redeemed_at", nullable = false, updatable = false)
    private OffsetDateTime redeemedAt;

    @Column(name = "used_at")
    private OffsetDateTime usedAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;
}

