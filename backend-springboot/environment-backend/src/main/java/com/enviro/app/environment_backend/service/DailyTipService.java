package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.DailyTipResponse;
import com.enviro.app.environment_backend.model.DailyTip;
import com.enviro.app.environment_backend.repository.DailyTipRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DailyTipService {

    private final DailyTipRepository repository;

    public DailyTipService(DailyTipRepository repository) {
        this.repository = repository;
    }

    public DailyTipResponse getTodayTip() {
        LocalDate today = LocalDate.now();
        Optional<DailyTip> tip = repository.findByDisplayDateAndIsActiveTrue(today);
        
        if (tip.isPresent()) {
            return mapToResponse(tip.get());
        }

        // Nếu không có tip cho hôm nay, trả về tip mới nhất
        List<DailyTip> tips = repository.findByIsActiveTrueOrderByCreatedAtDesc();
        if (tips.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không có gợi ý nào");
        }
        
        return mapToResponse(tips.get(0));
    }

    public List<DailyTipResponse> getAllTips() {
        List<DailyTip> tips = repository.findByIsActiveTrueOrderByCreatedAtDesc();
        return tips.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DailyTipResponse> getTipsByCategory(String category) {
        List<DailyTip> tips = repository.findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(category);
        return tips.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DailyTipResponse mapToResponse(DailyTip tip) {
        return DailyTipResponse.builder()
                .id(tip.getId())
                .title(tip.getTitle())
                .description(tip.getDescription())
                .category(tip.getCategory())
                .iconUrl(tip.getIconUrl())
                .actionText(tip.getActionText())
                .pointsReward(tip.getPointsReward())
                .displayDate(tip.getDisplayDate())
                .createdAt(tip.getCreatedAt())
                .build();
    }
}

