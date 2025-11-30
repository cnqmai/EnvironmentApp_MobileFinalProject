// File: .../controller/ChatbotController.java
package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.ChatbotRequest;
import com.enviro.app.environment_backend.dto.ChatbotResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.ChatbotService;
import com.enviro.app.environment_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserService userService;

    public ChatbotController(ChatbotService chatbotService, UserService userService) {
        this.chatbotService = chatbotService;
        this.userService = userService;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByEmail(email).orElseThrow();
    }

    @PostMapping("/message")
    public ResponseEntity<ChatbotResponse> sendMessage(@Valid @RequestBody ChatbotRequest request) {
        return ResponseEntity.ok(chatbotService.processMessage(getCurrentUser(), request));
    }

    // Lấy danh sách các cuộc hội thoại (Sessions)
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatbotResponse>> getSessions() {
        return ResponseEntity.ok(chatbotService.getChatSessions(getCurrentUser()));
    }

    // Lấy chi tiết tin nhắn của 1 hội thoại
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<ChatbotResponse>> getSessionMessages(@PathVariable String sessionId) {
        return ResponseEntity.ok(chatbotService.getSessionMessages(sessionId));
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String sessionId) {
        chatbotService.deleteSession(sessionId, getCurrentUser());
        return ResponseEntity.noContent().build();
    }
}