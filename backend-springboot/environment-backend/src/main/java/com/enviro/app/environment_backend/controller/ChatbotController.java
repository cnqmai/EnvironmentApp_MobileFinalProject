package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.ChatbotRequest;
import com.enviro.app.environment_backend.dto.ChatbotResponse;
import com.enviro.app.environment_backend.model.ChatbotHistory;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.ChatbotService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatbotResponse> chat(@RequestBody ChatbotRequest request) {
        User user = getCurrentUser();
        ChatbotResponse response = chatbotService.processChat(user.getId(), request.getMessage());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<ChatbotHistory>> getHistory() {
        User user = getCurrentUser();
        return ResponseEntity.ok(chatbotService.getUserHistory(user.getId()));
    }
}