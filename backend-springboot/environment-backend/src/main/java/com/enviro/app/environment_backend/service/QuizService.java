package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.QuizScoreResponse;
import com.enviro.app.environment_backend.dto.QuizSubmitRequest;
import com.enviro.app.environment_backend.model.*;
import com.enviro.app.environment_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Quiz getQuizById(UUID id) {
        return quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    @Transactional
    public QuizScoreResponse submitQuiz(UUID userId, UUID quizId, QuizSubmitRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        Quiz quiz = getQuizById(quizId);

        int correctCount = 0;
        List<QuizQuestion> questions = quiz.getQuestions();
        Map<UUID, Integer> answers = request.getAnswers(); 

        for (QuizQuestion q : questions) {
            if (answers.containsKey(q.getId())) {
                if (answers.get(q.getId()).equals(q.getCorrectOptionIndex())) {
                    correctCount++;
                }
            }
        }

        int pointsEarned = correctCount * 5;
        BigDecimal percentage = BigDecimal.ZERO;
        if (!questions.isEmpty()) {
            percentage = BigDecimal.valueOf(correctCount)
                    .divide(BigDecimal.valueOf(questions.size()), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        user.setPoints(user.getPoints() + pointsEarned);
        userRepository.save(user);
        badgeService.checkAndAssignBadges(user); // Gamification Trigger

        UserQuizScore score = new UserQuizScore();
        score.setUser(user);
        score.setQuiz(quiz);
        score.setScore(correctCount);
        score.setTotalQuestions(questions.size());
        score.setPercentage(percentage);
        score.setTimeTakenSeconds(request.getTimeTakenSeconds());
        score.setCompletedAt(OffsetDateTime.now());
        UserQuizScore savedScore = userQuizScoreRepository.save(score);

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
}