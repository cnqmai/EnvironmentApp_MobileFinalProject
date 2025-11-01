package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.ChatbotHistory;
import com.enviro.app.environment_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatbotHistoryRepository extends JpaRepository<ChatbotHistory, UUID> {
    
    /**
     * Lấy lịch sử chat của một user, sắp xếp theo thời gian mới nhất
     */
    List<ChatbotHistory> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Lấy lịch sử chat của một user theo user_id
     */
    List<ChatbotHistory> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

