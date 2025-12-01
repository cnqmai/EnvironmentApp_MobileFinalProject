package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.DailyTip;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.DailyTipRepository;
import com.enviro.app.environment_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DailyTipService {

    private final DailyTipRepository dailyTipRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService; 

    public DailyTipService(DailyTipRepository dailyTipRepository, 
                           UserRepository userRepository,
                           BadgeService badgeService) {
        this.dailyTipRepository = dailyTipRepository;
        this.userRepository = userRepository;
        this.badgeService = badgeService;
    }

    public List<DailyTip> getAllTips() {
        return dailyTipRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<DailyTip> getTipsByCategory(String category) {
        return dailyTipRepository.findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(category);
    }
    
    public DailyTip getTodayTip() {
         return dailyTipRepository.findByDisplayDateAndIsActiveTrue(LocalDate.now())
                 .orElse(getRandomTip()); // Nếu không có tip set cho hôm nay, lấy random
    }

    // --- PHƯƠNG THỨC MỚI ---
    public DailyTip getRandomTip() {
        List<DailyTip> tips = dailyTipRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        if (tips.isEmpty()) {
            return null;
        }
        // Chọn ngẫu nhiên 1 tip trong danh sách
        int randomIndex = (int) (Math.random() * tips.size());
        return tips.get(randomIndex);
    }

    @Transactional
    public void markTipAsCompleted(UUID userId, UUID tipId) { // Lưu ý: tipId là UUID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        DailyTip tip = dailyTipRepository.findById(tipId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tip not found"));

        // Cộng điểm
        int points = tip.getPointsReward() != null ? tip.getPointsReward() : 10;
        user.setPoints(user.getPoints() + points);
        userRepository.save(user);

        // Check huy hiệu
        badgeService.checkAndAssignBadges(user);
    }
}