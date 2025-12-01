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

    // [FIX] Đổi tên hàm checkAndAwardBadges cho khớp với ReportService gọi
    @Transactional
    public void checkAndAwardBadges(User user) {
        checkAndAssignBadges(user);
    }

    private void assignBadge(User user, String badgeName) {
        Optional<Badge> badgeOpt = badgeRepository.findByName(badgeName);
        
        if (badgeOpt.isPresent()) {
            Badge badge = badgeOpt.get();
            // [FIX] Sử dụng phương thức repository đã có
            boolean alreadyHas = userBadgeRepository.existsByUserAndBadge(user, badge);
            
            if (!alreadyHas) {
                UserBadge userBadge = new UserBadge();
                // [FIX] Tạo ID đúng kiểu UUID
                UserBadgeId id = new UserBadgeId(user.getId(), badge.getId());
                userBadge.setId(id);
                userBadge.setUser(user);
                userBadge.setBadge(badge);
                // [FIX] Dùng setEarnedAt thay vì setAwardedAt (theo Entity)
                userBadge.setEarnedAt(LocalDateTime.now());
                
                userBadgeRepository.save(userBadge);
                System.out.println(">>> [BADGE] Assigned [" + badgeName + "] to user: " + user.getEmail());
            }
        }
    }

    // [FIX] Thêm phương thức hỗ trợ NotificationService (giả lập logic hoặc để trống nếu chưa dùng)
    public void incrementNotificationCount(User user, int count) {
        // Logic cập nhật số lượng badge trên icon app (nếu có)
    }

    public void decrementNotificationCount(User user, int count) {
        // Logic giảm số lượng badge
    }

    private BadgeResponse mapToResponse(Badge badge) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                // [FIX] Kiểm tra nếu Badge entity không có criteria thì bỏ qua hoặc thêm vào model
                // .criteria(badge.getCriteria()) 
                .build();
    }
}