package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.RewardResponse;
import com.enviro.app.environment_backend.dto.UserRewardResponse;
import com.enviro.app.environment_backend.model.Reward;
import com.enviro.app.environment_backend.model.RewardType;
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
import java.util.stream.Collectors;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;
    private final UserRewardRepository userRewardRepository;
    private final UserRepository userRepository;

    public RewardService(RewardRepository rewardRepository,
                        UserRewardRepository userRewardRepository,
                        UserRepository userRepository) {
        this.rewardRepository = rewardRepository;
        this.userRewardRepository = userRewardRepository;
        this.userRepository = userRepository;
    }

    public List<RewardResponse> getAllRewards() {
        List<Reward> rewards = rewardRepository.findByIsActiveTrueOrderByPointsCostAsc();
        return rewards.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RewardResponse> getRewardsByType(RewardType type) {
        List<Reward> rewards = rewardRepository.findByTypeAndIsActiveTrueOrderByPointsCostAsc(type);
        return rewards.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserRewardResponse redeemReward(User user, UUID rewardId) {
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phần thưởng"));

        if (!reward.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phần thưởng không còn hoạt động");
        }

        // Kiểm tra số lượng còn lại
        if (reward.getQuantityAvailable() != -1 && reward.getQuantityAvailable() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phần thưởng đã hết");
        }

        // Kiểm tra điểm của user
        if (user.getPoints() < reward.getPointsCost()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Bạn không đủ điểm. Cần " + reward.getPointsCost() + " điểm, hiện có " + user.getPoints() + " điểm");
        }

        // Trừ điểm
        user.setPoints(user.getPoints() - reward.getPointsCost());
        userRepository.save(user);

        // Giảm số lượng
        if (reward.getQuantityAvailable() != -1) {
            reward.setQuantityAvailable(reward.getQuantityAvailable() - 1);
            rewardRepository.save(reward);
        }

        // Tạo voucher code nếu là voucher
        String voucherCode = reward.getVoucherCode();
        if (reward.getType() == RewardType.VOUCHER && voucherCode == null) {
            voucherCode = "VCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        // Tính expiry date
        OffsetDateTime expiresAt = null;
        if (reward.getExpiryDate() != null) {
            expiresAt = reward.getExpiryDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        }

        // Tạo UserReward
        UserReward userReward = UserReward.builder()
                .user(user)
                .reward(reward)
                .voucherCode(voucherCode)
                .status("claimed")
                .expiresAt(expiresAt)
                .build();

        UserReward saved = userRewardRepository.save(userReward);

        return mapToUserRewardResponse(saved);
    }

    public List<UserRewardResponse> getUserRewards(User user) {
        List<UserReward> rewards = userRewardRepository.findByUserOrderByRedeemedAtDesc(user);
        return rewards.stream()
                .map(this::mapToUserRewardResponse)
                .collect(Collectors.toList());
    }

    private RewardResponse mapToResponse(Reward reward) {
        return RewardResponse.builder()
                .id(reward.getId())
                .name(reward.getName())
                .description(reward.getDescription())
                .type(reward.getType())
                .pointsCost(reward.getPointsCost())
                .imageUrl(reward.getImageUrl())
                .discountPercent(reward.getDiscountPercent())
                .quantityAvailable(reward.getQuantityAvailable())
                .expiryDate(reward.getExpiryDate())
                .createdAt(reward.getCreatedAt())
                .build();
    }

    private UserRewardResponse mapToUserRewardResponse(UserReward userReward) {
        return UserRewardResponse.builder()
                .id(userReward.getId())
                .rewardId(userReward.getReward().getId())
                .rewardName(userReward.getReward().getName())
                .rewardType(userReward.getReward().getType())
                .voucherCode(userReward.getVoucherCode())
                .status(userReward.getStatus())
                .redeemedAt(userReward.getRedeemedAt())
                .usedAt(userReward.getUsedAt())
                .expiresAt(userReward.getExpiresAt())
                .build();
    }
}

