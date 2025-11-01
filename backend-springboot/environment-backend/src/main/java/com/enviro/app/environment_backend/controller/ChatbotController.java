package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.ChatbotRequest;
import com.enviro.app.environment_backend.dto.ChatbotResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.ChatbotService;
import com.enviro.app.environment_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến Chatbot AI (FR-5.x)
 */
@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserService userService;

    public ChatbotController(ChatbotService chatbotService, UserService userService) {
        this.chatbotService = chatbotService;
        this.userService = userService;
    }

    /**
     * Phương thức tiện ích để lấy User đang đăng nhập từ JWT Token
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    /**
     * API GỬI CÂU HỎI ĐẾN CHATBOT (FR-5.1)
     * POST /api/chatbot/message
     */
    @PostMapping("/message")
    public ResponseEntity<ChatbotResponse> sendMessage(@Valid @RequestBody ChatbotRequest request) {
        User user = getCurrentUser();
        ChatbotResponse response = chatbotService.processMessage(user, request);
        return ResponseEntity.ok(response);
    }

    /**
     * API LẤY LỊCH SỬ CHAT (FR-1.2.3, FR-5.1)
     * GET /api/chatbot/history
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatbotResponse>> getChatHistory() {
        User user = getCurrentUser();
        List<ChatbotResponse> history = chatbotService.getChatHistory(user);
        return ResponseEntity.ok(history);
    }
}

