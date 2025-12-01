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

import java.time.LocalDateTime;
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
    public void redeemReward(UUID userId, UUID rewardId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reward not found"));

        if (user.getPoints() < reward.getPointsCost()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn không đủ điểm.");
        }

        user.setPoints(user.getPoints() - reward.getPointsCost());
        userRepository.save(user);

        UserReward history = new UserReward();
        history.setUser(user);
        history.setReward(reward);
        history.setRedeemedAt(LocalDateTime.now());
        history.setStatus("PENDING");
        userRewardRepository.save(history);
    }
}