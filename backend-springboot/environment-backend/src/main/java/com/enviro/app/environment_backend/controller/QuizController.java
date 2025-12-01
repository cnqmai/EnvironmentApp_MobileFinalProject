package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.QuizResponse;
import com.enviro.app.environment_backend.dto.QuizScoreResponse;
import com.enviro.app.environment_backend.dto.QuizSubmitRequest;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.QuizService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // 1. Lấy danh sách tất cả bài Quiz
    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    // 2. Lấy chi tiết bài Quiz (để bắt đầu làm bài)
    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    // 3. Nộp bài
    @PostMapping("/{id}/submit")
    public ResponseEntity<QuizScoreResponse> submitQuiz(@PathVariable UUID id, @RequestBody QuizSubmitRequest request) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(quizService.submitQuiz(user.getId(), id, request));
    }
}