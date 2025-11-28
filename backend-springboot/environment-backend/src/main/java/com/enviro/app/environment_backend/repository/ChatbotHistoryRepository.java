// File: .../repository/ChatbotHistoryRepository.java
package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.ChatbotHistory;
import com.enviro.app.environment_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatbotHistoryRepository extends JpaRepository<ChatbotHistory, UUID> {
    // Lấy toàn bộ lịch sử để phân nhóm
    List<ChatbotHistory> findByUserOrderByCreatedAtDesc(User user);

    // [MỚI] Lấy chi tiết tin nhắn của một cuộc hội thoại cụ thể
    List<ChatbotHistory> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    // [MỚI] Xóa cả cuộc hội thoại
    void deleteBySessionId(String sessionId);
}