package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.BadgeResponse;
import com.enviro.app.environment_backend.model.Badge;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserBadge;
import com.enviro.app.environment_backend.repository.BadgeRepository;
import com.enviro.app.environment_backend.repository.UserBadgeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime; 
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    // ĐÃ XÓA: private final UserService userService;

    // Chỉ còn 2 dependencies cần thiết cho BadgeService
    public BadgeService(BadgeRepository badgeRepository, UserBadgeRepository userBadgeRepository) { 
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    public List<BadgeResponse> getAllBadges() {
        return badgeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BadgeResponse> getUserBadges(UUID userId) {
        return userBadgeRepository.findByUserIdOrderByEarnedAtDesc(userId).stream()
                .map(ub -> mapToResponse(ub.getBadge()))
                .collect(Collectors.toList());
    }

    // --- THÊM LOGIC CỘNG ĐIỂM (FR-9.1.1) ---
    /**
     * Cộng điểm cho người dùng sau khi phân loại rác và kiểm tra huy hiệu.
     * @param user Người dùng hiện tại
     * @param pointsToEarn Số điểm muốn cộng (theo yêu cầu là 10)
     * @return User đã được cập nhật điểm nhưng chưa được lưu vào DB (để UserController lưu)
     */
    @Transactional
    public User addRecyclePoints(User user, int pointsToEarn) {
        // 1. Cộng điểm
        int currentPoints = user.getPoints();
        user.setPoints(currentPoints + pointsToEarn);
        
        // 2. Kiểm tra và gán huy hiệu
        checkAndAssignBadges(user);
        
        // 3. Trả về user đã cập nhật
        return user;
    }
    
    @Transactional
    public void checkAndAssignBadges(User user) {
        int points = user.getPoints();
        if (points >= 500) assignBadge(user, "Chiến binh Môi trường");
        if (points >= 1000) assignBadge(user, "Thành phố Sạch");
    }

    private void assignBadge(User user, String badgeName) {
        Optional<Badge> badgeOpt = badgeRepository.findByName(badgeName);
        if (badgeOpt.isPresent()) {
            Badge badge = badgeOpt.get();
            boolean alreadyHas = userBadgeRepository.existsByUserAndBadge(user, badge);
            if (!alreadyHas) {
                UserBadge userBadge = new UserBadge();
                userBadge.setUser(user);
                userBadge.setBadge(badge);
                userBadge.setEarnedAt(OffsetDateTime.now());
                
                userBadgeRepository.save(userBadge);
            }
        }
    }
    
    // Placeholder cho NotificationService gọi để tránh lỗi biên dịch
    public void incrementNotificationCount(User user, int count) {}
    public void decrementNotificationCount(User user, int count) {}

    private BadgeResponse mapToResponse(Badge badge) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .requiredPoints(badge.getRequiredPoints()) 
                .build();
    }
}