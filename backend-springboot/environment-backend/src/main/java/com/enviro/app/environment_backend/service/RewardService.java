package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.Reward;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserReward;
import com.enviro.app.environment_backend.repository.RewardRepository;
import com.enviro.app.environment_backend.repository.UserRepository;
import com.enviro.app.environment_backend.repository.UserRewardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime; 
import java.util.List;
import java.util.UUID;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;
    private final UserRewardRepository userRewardRepository;
    private final UserRepository userRepository;

    public RewardService(RewardRepository rewardRepository, UserRewardRepository userRewardRepository, UserRepository userRepository) {
        this.rewardRepository = rewardRepository;
        this.userRewardRepository = userRewardRepository;
        this.userRepository = userRepository;
    }

    public List<Reward> getAllRewards() { return rewardRepository.findAll(); }

    public List<UserReward> getUserHistory(UUID userId) {
        return userRewardRepository.findByUserIdOrderByRedeemedAtDesc(userId);
    }

    @Transactional
    // Đã cập nhật để nhận User object đã được Controller xác thực
    public User redeemReward(User user, UUID rewardId) { 
        
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reward not found"));

        if (user.getPoints() < reward.getPointsCost()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn không đủ điểm.");
        }
        
        // 1. Trừ điểm người dùng và lưu User
        user.setPoints(user.getPoints() - reward.getPointsCost());
        userRepository.save(user);

        // 2. Ghi nhận giao dịch đổi quà
        UserReward history = new UserReward();
        history.setUser(user);
        history.setReward(reward);
        history.setRedeemedAt(OffsetDateTime.now());
        history.setStatus("PENDING");
        userRewardRepository.save(history);
        
        // 3. Giảm số lượng tồn kho (nếu có)
        if (reward.getQuantityAvailable() != -1) { 
             reward.setQuantityAvailable(reward.getQuantityAvailable() - 1);
             rewardRepository.save(reward);
        }
        
        // Trả về User đã cập nhật điểm
        return user;
    }
}