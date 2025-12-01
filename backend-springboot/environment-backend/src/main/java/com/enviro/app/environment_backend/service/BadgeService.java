package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.BadgeResponse;
import com.enviro.app.environment_backend.model.Badge;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserBadge;
import com.enviro.app.environment_backend.model.UserBadgeId;
import com.enviro.app.environment_backend.repository.BadgeRepository;
import com.enviro.app.environment_backend.repository.UserBadgeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

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

    @Transactional
    public void checkAndAssignBadges(User user) {
        int points = user.getPoints();
        if (points >= 100) assignBadge(user, "Người Xanh");
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
                userBadge.setId(new UserBadgeId(user.getId(), badge.getId()));
                userBadge.setUser(user);
                userBadge.setBadge(badge);
                userBadge.setEarnedAt(LocalDateTime.now());
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
                .criteria(badge.getCriteria())
                .build();
    }
}