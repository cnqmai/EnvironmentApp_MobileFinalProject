package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecycleService {

    private final UserRepository userRepository;
    private final BadgeService badgeService;

    public RecycleService(UserRepository userRepository, BadgeService badgeService) {
        this.userRepository = userRepository;
        this.badgeService = badgeService;
    }

    @Transactional
    public int confirmRecycle(User user, String wasteType) {
        // Cộng điểm thưởng (Ví dụ: 5 điểm cho mỗi lần phân loại đúng)
        int pointsReward = 5;
        user.setPoints(user.getPoints() + pointsReward);
        userRepository.save(user);

        // Kiểm tra thăng cấp huy hiệu
        badgeService.checkAndAssignBadges(user);

        return user.getPoints(); // Trả về tổng điểm mới
    }
}