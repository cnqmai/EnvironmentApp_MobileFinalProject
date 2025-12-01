package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.DailyTip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyTipRepository extends JpaRepository<DailyTip, UUID> {
    
    /**
     * Tìm DailyTip dựa trên displayDate.
     * @param displayDate ngày hiển thị (sử dụng LocalDate.now())
     * @return Optional chứa DailyTip nếu tìm thấy
     */
    Optional<DailyTip> findByDisplayDate(LocalDate displayDate);
}