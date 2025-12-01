// File: .../service/QuizService.java
package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.QuizScoreResponse;
import com.enviro.app.environment_backend.dto.QuizSubmitRequest;
import com.enviro.app.environment_backend.model.Quiz;
import com.enviro.app.environment_backend.model.QuizQuestion;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserQuizScore;
import com.enviro.app.environment_backend.repository.QuizRepository;
import com.enviro.app.environment_backend.repository.UserQuizScoreRepository;
import com.enviro.app.environment_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime; // [FIX] Dùng OffsetDateTime
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final UserQuizScoreRepository userQuizScoreRepository;

    public QuizService(QuizRepository quizRepository, UserRepository userRepository, UserQuizScoreRepository userQuizScoreRepository) {
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.userQuizScoreRepository = userQuizScoreRepository;
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Quiz getQuizById(UUID id) {
        return quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    @Transactional
    public QuizScoreResponse submitQuiz(UUID userId, UUID quizId, QuizSubmitRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Quiz quiz = getQuizById(quizId);

        int correctCount = 0;
        List<QuizQuestion> questions = quiz.getQuestions();
        
        // Map<QuestionId, AnswerIndex>
        Map<UUID, Integer> answers = request.getAnswers(); 

        for (QuizQuestion q : questions) {
            if (answers.containsKey(q.getId())) {
                Integer userAnswer = answers.get(q.getId());
                // So sánh index (Integer)
                if (userAnswer != null && userAnswer.equals(q.getCorrectOptionIndex())) {
                    correctCount++;
                }
            }
        }

        // Tính điểm: Mỗi câu đúng 5 điểm (hoặc logic tùy chỉnh)
        int pointsEarned = correctCount * 5;
        
        // Tính phần trăm
        BigDecimal percentage = BigDecimal.ZERO;
        if (!questions.isEmpty()) {
            percentage = BigDecimal.valueOf(correctCount)
                    .divide(BigDecimal.valueOf(questions.size()), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // Cộng điểm vào User
        user.setPoints(user.getPoints() + pointsEarned);
        userRepository.save(user);

        // Lưu lịch sử làm bài
        UserQuizScore score = new UserQuizScore();
        score.setUser(user);
        score.setQuiz(quiz);
        score.setScore(correctCount); // Lưu số câu đúng
        score.setTotalQuestions(questions.size());
        score.setPercentage(percentage);
        score.setTimeTakenSeconds(request.getTimeTakenSeconds());
        
        // [FIX] Sử dụng OffsetDateTime để khớp với Entity
        score.setCompletedAt(OffsetDateTime.now());
        
        UserQuizScore savedScore = userQuizScoreRepository.save(score);

        // Trả về kết quả
        return QuizScoreResponse.builder()
                .id(savedScore.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .correctCount(correctCount)      // [FIX] Khớp với DTO đã sửa
                .totalQuestions(questions.size())
                .pointsEarned(pointsEarned)      // [FIX] Khớp với DTO đã sửa
                .percentage(percentage)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .completedAt(savedScore.getCompletedAt())
                .build();
    }
    
    public List<UserQuizScore> getUserQuizScores(User user) {
        return userQuizScoreRepository.findByUserOrderByCompletedAtDesc(user);
    }
}