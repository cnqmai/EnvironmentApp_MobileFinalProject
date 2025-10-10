package com.enviro.app.environment_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.OffsetDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token; // Token ngẫu nhiên (UUID)

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user; // Liên kết với user

    private OffsetDateTime expiryDate; // Thời gian hết hạn của token

    public boolean isExpired() {
        // Kiểm tra xem thời gian hiện tại có sau thời gian hết hạn hay không
        return expiryDate.isBefore(OffsetDateTime.now());
    }
}