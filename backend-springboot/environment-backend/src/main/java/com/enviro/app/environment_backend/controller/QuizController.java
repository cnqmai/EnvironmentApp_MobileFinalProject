package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.QuizResponse;
import com.enviro.app.environment_backend.dto.QuizScoreResponse;
import com.enviro.app.environment_backend.dto.QuizSubmitRequest;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.QuizService;
import com.enviro.app.environment_backend.service.UserService;
import org.springframework.http.HttpStatus; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException; // Cần import này

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
    
    // ĐÃ XÓA: private User getCurrentUser() { return userService.getCurrentUser(); }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<QuizScoreResponse> submitQuiz(
            @PathVariable UUID id,
            @Valid @RequestBody QuizSubmitRequest request) {
        
        // 1. Lấy User đang đăng nhập từ UserService (đã sửa lỗi)
        User user = userService.getCurrentUser();
        
        // 2. Kiểm tra nếu không có User (chưa đăng nhập/token hết hạn)
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để nộp bài Quiz.");
        }
        
        // 3. Gọi Service với ID chính xác của người dùng hiện tại
        QuizScoreResponse response = quizService.submitQuiz(user.getId(), id, request);
        return ResponseEntity.ok(response);
    }
}