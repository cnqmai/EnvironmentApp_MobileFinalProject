package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.QuizResponse;
import com.enviro.app.environment_backend.dto.QuizScoreResponse;
import com.enviro.app.environment_backend.dto.QuizSubmitRequest;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.QuizService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
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
    
    // Helper function (Giả định tồn tại trong UserService)
    private User getCurrentUser() {
        return userService.getCurrentUser();
    }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    // Lấy chi tiết Quiz (Frontend gọi API này)
    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<QuizScoreResponse> submitQuiz(
            @PathVariable UUID id,
            @Valid @RequestBody QuizSubmitRequest request) {
        
        User user = getCurrentUser();
        QuizScoreResponse response = quizService.submitQuiz(user.getId(), id, request);
        return ResponseEntity.ok(response);
    }
}