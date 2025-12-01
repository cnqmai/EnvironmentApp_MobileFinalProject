package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.DailyTipResponse;
import com.enviro.app.environment_backend.model.DailyTip;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserDailyTipCompletion;
import com.enviro.app.environment_backend.repository.DailyTipRepository;
import com.enviro.app.environment_backend.repository.UserDailyTipCompletionRepository;
import com.enviro.app.environment_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit; // Cần thiết cho việc tính toán thời gian
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DailyTipService {

    private final DailyTipRepository dailyTipRepository;
    private final UserRepository userRepository;
    private final UserDailyTipCompletionRepository completionRepository;
    private final BadgeService badgeService;

    // CẬP NHẬT CONSTRUCTOR
    public DailyTipService(DailyTipRepository dailyTipRepository, UserRepository userRepository,
                           UserDailyTipCompletionRepository completionRepository, BadgeService badgeService) {
        this.dailyTipRepository = dailyTipRepository;
        this.userRepository = userRepository;
        this.completionRepository = completionRepository;
        this.badgeService = badgeService;
    }

    public List<DailyTipResponse> getAllTips() {
        return dailyTipRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Phương thức lấy Mẹo hôm nay
    public DailyTipResponse getDailyTip() {
        DailyTip dailyTip = dailyTipRepository.findByDisplayDate(LocalDate.now())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No daily tip available today."));
        
        return mapToResponse(dailyTip);
    }
    
    // Phương thức kiểm tra và cộng điểm Daily Tip (ĐÃ SỬA VỚI LOGIC KIỂM TRA NGÀY)
    @Transactional
    public DailyTipResponse claimDailyTipReward(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        DailyTip todayTip = dailyTipRepository.findByDisplayDate(LocalDate.now())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No daily tip available today."));

        // 1. KIỂM TRA GIỚI HẠN HOÀN THÀNH HÔM NAY (PER-USER, PER-DAY)
        // Tính toán thời điểm 00:00:00 của ngày hiện tại (với múi giờ của server)
        OffsetDateTime startOfDay = OffsetDateTime.now()
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
        
        // Tìm bản ghi hoàn thành cho người dùng và Mẹo này sau 00:00 hôm nay
        Optional<UserDailyTipCompletion> existingCompletion = 
                completionRepository.findByUserAndDailyTipAndCompletedAfter(user, todayTip, startOfDay);

        if (existingCompletion.isPresent()) {
            // Ném ra lỗi 403 Forbidden nếu người dùng đã claim hôm nay
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Reward for today's daily tip has already been claimed by this user. Try again tomorrow.");
        }
        
        // 2. CỘNG ĐIỂM VÀ LƯU TRẠNG THÁI HOÀN THÀNH
        int pointsEarned = todayTip.getPointsReward();
        
        user.setPoints(user.getPoints() + pointsEarned);
        userRepository.save(user);
        
        badgeService.checkAndAssignBadges(user);

        // Lưu bản ghi hoàn thành mới
        UserDailyTipCompletion newCompletion = new UserDailyTipCompletion();
        newCompletion.setUser(user);
        newCompletion.setDailyTip(todayTip);
        newCompletion.setCompletedAt(OffsetDateTime.now());
        completionRepository.save(newCompletion);

        return mapToResponse(todayTip);
    }


    private DailyTipResponse mapToResponse(DailyTip dailyTip) {
        return DailyTipResponse.builder()
                .id(dailyTip.getId())
                .title(dailyTip.getTitle())
                .description(dailyTip.getDescription())
                .category(dailyTip.getCategory())
                .iconUrl(dailyTip.getIconUrl())
                .actionText(dailyTip.getActionText())
                .pointsReward(dailyTip.getPointsReward())
                .displayDate(dailyTip.getDisplayDate())
                .build();
    }
}