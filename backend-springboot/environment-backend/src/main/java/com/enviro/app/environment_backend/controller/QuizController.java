package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.QuizResponse;
import com.enviro.app.environment_backend.dto.QuizScoreResponse;
import com.enviro.app.environment_backend.dto.QuizSubmitRequest;
import com.enviro.app.environment_backend.model.Quiz;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.QuizService;
import com.enviro.app.environment_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final UserService userService;

    public QuizController(QuizService quizService, UserService userService) {
        this.quizService = quizService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {
        // [FIX] Map từ Entity sang DTO
        List<QuizResponse> responses = quizService.getAllQuizzes().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable UUID id) { // [FIX] UUID
        return ResponseEntity.ok(mapToResponse(quizService.getQuizById(id)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<QuizScoreResponse> submitQuiz(
            @PathVariable UUID id, // [FIX] UUID
            @Valid @RequestBody QuizSubmitRequest request) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(quizService.submitQuiz(user.getId(), id, request));
    }

    private QuizResponse mapToResponse(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                // Map thêm questions nếu cần thiết cho DTO
                .build();
    }
}