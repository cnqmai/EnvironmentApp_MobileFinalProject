package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.DailyTip;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserDailyTipCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDailyTipCompletionRepository extends JpaRepository<UserDailyTipCompletion, UUID> {
    
    /**
     * Tìm bản ghi hoàn thành cho User và DailyTip, chỉ những bản ghi được hoàn thành SAU một thời điểm nhất định (startOfDay).
     * Điều này cho phép giới hạn nộp bài là 1 lần/ngày.
     */
    @Query("SELECT utc FROM UserDailyTipCompletion utc WHERE utc.user = ?1 AND utc.dailyTip = ?2 AND utc.completedAt >= ?3")
    Optional<UserDailyTipCompletion> findByUserAndDailyTipAndCompletedAfter(
            User user, DailyTip dailyTip, OffsetDateTime startOfDay);
            
    // Xóa phương thức findByUserAndDailyTip cũ nếu nó vẫn còn
}