package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.DailyTip;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.DailyTipRepository;
import com.enviro.app.environment_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DailyTipService {

    private final DailyTipRepository dailyTipRepository;
    private final UserRepository userRepository;

    public DailyTipService(DailyTipRepository dailyTipRepository, UserRepository userRepository) {
        this.dailyTipRepository = dailyTipRepository;
        this.userRepository = userRepository;
    }

    public DailyTip getTodayTip() {
        List<DailyTip> tips = dailyTipRepository.findAll();
        if (tips.isEmpty()) return null;
        int dayOfYear = LocalDate.now().getDayOfYear();
        return tips.get(dayOfYear % tips.size());
    }

    public List<DailyTip> getAllTips() {
        return dailyTipRepository.findAll();
    }
    
    // [FIX] Thêm phương thức tìm theo category
    public List<DailyTip> getTipsByCategory(String category) {
        // Giả sử logic lọc thủ công nếu Repository chưa có method
        return dailyTipRepository.findAll().stream()
                .filter(t -> category.equalsIgnoreCase(t.getCategory()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void markTipAsCompleted(UUID userId, UUID tipId) { // [FIX] UUID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        DailyTip tip = dailyTipRepository.findById(tipId)
                .orElseThrow(() -> new RuntimeException("Tip not found"));

        int rewardPoints = 10;
        user.setPoints(user.getPoints() + rewardPoints);
        userRepository.save(user);
    }
}