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
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service xử lý logic cho Badges System (FR-9.1.2)
 */
@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    public BadgeService(BadgeRepository badgeRepository, UserBadgeRepository userBadgeRepository) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    /**
     * Lấy tất cả badges (FR-9.1.2)
     * Nếu user được truyền vào, sẽ đánh dấu badges nào user đã đạt được
     */
    public List<BadgeResponse> getAllBadges(User user) {
        List<Badge> badges = badgeRepository.findAllByOrderByRequiredPointsAsc();
        Set<Integer> earnedBadgeIds = userBadgeRepository.findByUserOrderByEarnedAtDesc(user)
                .stream()
                .map(ub -> ub.getBadge().getId())
                .collect(Collectors.toSet());

        return badges.stream()
                .map(badge -> {
                    boolean isEarned = earnedBadgeIds.contains(badge.getId());
                    OffsetDateTime earnedAt = null;
                    if (isEarned) {
                        UserBadge userBadge = userBadgeRepository.findByUserAndBadge(user, badge)
                                .orElse(null);
                        if (userBadge != null) {
                            earnedAt = userBadge.getEarnedAt();
                        }
                    }
                    return mapToBadgeResponse(badge, isEarned, earnedAt);
                })
                .collect(Collectors.toList());
    }

    /**
     * Lấy badges của một user (FR-9.1.2)
     */
    public List<BadgeResponse> getUserBadges(User user) {
        List<UserBadge> userBadges = userBadgeRepository.findByUserOrderByEarnedAtDesc(user);
        
        return userBadges.stream()
                .map(ub -> mapToBadgeResponse(ub.getBadge(), true, ub.getEarnedAt()))
                .collect(Collectors.toList());
    }

    /**
     * Tự động trao badge cho user nếu đạt đủ điểm (FR-9.1.2)
     * Được gọi khi user đạt được điểm mới
     */
    @Transactional
    public void checkAndAwardBadges(User user) {
        int userPoints = user.getPoints();
        
        // Lấy tất cả badges mà user chưa có và có điểm yêu cầu <= điểm hiện tại
        List<Badge> eligibleBadges = badgeRepository.findByRequiredPointsLessThanEqualOrderByRequiredPointsAsc(userPoints);
        
        for (Badge badge : eligibleBadges) {
            // Kiểm tra xem user đã có badge này chưa
            if (!userBadgeRepository.existsByUserAndBadge(user, badge)) {
                // Trao badge mới
                UserBadge newUserBadge = UserBadge.builder()
                        .user(user)
                        .badge(badge)
                        .build();
                userBadgeRepository.save(newUserBadge);
            }
        }
    }

    /**
     * Map Badge entity sang BadgeResponse DTO
     */
    private BadgeResponse mapToBadgeResponse(Badge badge, boolean isEarned, OffsetDateTime earnedAt) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .requiredPoints(badge.getRequiredPoints())
                .isEarned(isEarned)
                .earnedAt(earnedAt)
                .build();
    }
}

