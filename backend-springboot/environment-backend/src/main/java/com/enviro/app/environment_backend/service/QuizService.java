package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.QuizQuestionResponse;
import com.enviro.app.environment_backend.dto.QuizResponse;
import com.enviro.app.environment_backend.dto.QuizScoreResponse;
import com.enviro.app.environment_backend.dto.QuizSubmitRequest;
import com.enviro.app.environment_backend.model.*;
import com.enviro.app.environment_backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final UserQuizScoreRepository userQuizScoreRepository;
    private final BadgeService badgeService;

    public QuizService(QuizRepository quizRepository, UserRepository userRepository, 
                       UserQuizScoreRepository userQuizScoreRepository, BadgeService badgeService) {
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.userQuizScoreRepository = userQuizScoreRepository;
        this.badgeService = badgeService;
    }

    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::mapToResponseLite)
                .collect(Collectors.toList());
    }

    @Transactional 
    public QuizResponse getQuizById(UUID id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        return mapToResponseFull(quiz);
    }

    @Transactional
    public QuizScoreResponse submitQuiz(UUID userId, UUID quizId, QuizSubmitRequest request) {
        User user = userRepository.findById(userId)
             .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Quiz quiz = quizRepository.findById(quizId)
             .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));

        // 1. Tính điểm
        int correctCount = 0;
        List<QuizQuestion> questions = quiz.getQuestions();
        Map<UUID, Integer> answers = request.getAnswers(); 

        for (QuizQuestion q : questions) {
            if (answers.containsKey(q.getId())) {
                Integer selectedOption = answers.get(q.getId());
                // Sử dụng phương thức tiện ích getCorrectOptionIndex() của Entity
                if (selectedOption != null && selectedOption.equals(q.getCorrectOptionIndex())) { 
                    correctCount++;
                }
            }
        }

        int pointsEarned = correctCount * 10;
        BigDecimal percentage = BigDecimal.ZERO;
        if (!questions.isEmpty()) {
            percentage = BigDecimal.valueOf(correctCount)
                    .divide(BigDecimal.valueOf(questions.size()), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // 2. Cộng điểm cho User 
        user.setPoints(user.getPoints() + pointsEarned);
        userRepository.save(user);
        badgeService.checkAndAssignBadges(user);

        // 3. Lưu hoặc Cập nhật kết quả bài thi
        Optional<UserQuizScore> existingScore = userQuizScoreRepository.findByUserAndQuiz(user, quiz);
        
        UserQuizScore scoreToSave;
        if (existingScore.isPresent()) {
            scoreToSave = existingScore.get();
        } else {
            scoreToSave = new UserQuizScore();
            scoreToSave.setUser(user);
            scoreToSave.setQuiz(quiz);
        }

        // Cập nhật các thông số
        scoreToSave.setScore(correctCount);
        scoreToSave.setTotalQuestions(questions.size());
        scoreToSave.setPercentage(percentage);
        scoreToSave.setTimeTakenSeconds(request.getTimeTakenSeconds());
        scoreToSave.setCompletedAt(OffsetDateTime.now());
        
        UserQuizScore savedScore = userQuizScoreRepository.save(scoreToSave);

        return QuizScoreResponse.builder()
                .id(savedScore.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .correctCount(correctCount)
                .totalQuestions(questions.size())
                .pointsEarned(pointsEarned)
                .percentage(percentage)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .completedAt(savedScore.getCompletedAt())
                .build();
    }

    private QuizResponse mapToResponseFull(Quiz quiz) {
        // Ánh xạ danh sách Questions đã được tải đầy đủ nhờ @Transactional
        List<QuizQuestionResponse> questions = quiz.getQuestions().stream()
                .map(q -> QuizQuestionResponse.builder() // <-- Đã fix lỗi biên dịch Builder
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .orderNumber(q.getOrderNumber())
                        .build())
                .collect(Collectors.toList());

        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .questions(questions) // Gán danh sách Questions đã ánh xạ
                .build();
    }

    private QuizResponse mapToResponseLite(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .build();
    }
}