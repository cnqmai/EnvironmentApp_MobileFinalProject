package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.QuizResponse;
import com.enviro.app.environment_backend.dto.QuizScoreResponse;
import com.enviro.app.environment_backend.dto.QuizSubmitRequest;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.QuizService;
import com.enviro.app.environment_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final UserService userService;

    public QuizController(QuizService quizService, UserService userService) {
        this.quizService = quizService;
        this.userService = userService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getQuizById(id, false));
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizScoreResponse> submitQuiz(@Valid @RequestBody QuizSubmitRequest request) {
        User user = getCurrentUser();
        return ResponseEntity.ok(quizService.submitQuiz(user, request));
    }

    @GetMapping("/me/scores")
    public ResponseEntity<List<QuizScoreResponse>> getMyScores() {
        User user = getCurrentUser();
        return ResponseEntity.ok(quizService.getUserQuizScores(user));
    }
}

