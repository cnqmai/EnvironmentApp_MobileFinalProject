package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.QuizQuestionResponse;
import com.enviro.app.environment_backend.dto.QuizResponse;
import com.enviro.app.environment_backend.dto.QuizScoreResponse;
import com.enviro.app.environment_backend.dto.QuizSubmitRequest;
import com.enviro.app.environment_backend.model.Quiz;
import com.enviro.app.environment_backend.model.QuizQuestion;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.model.UserQuizScore;
import com.enviro.app.environment_backend.repository.QuizQuestionRepository;
import com.enviro.app.environment_backend.repository.QuizRepository;
import com.enviro.app.environment_backend.repository.UserQuizScoreRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final UserQuizScoreRepository scoreRepository;

    public QuizService(QuizRepository quizRepository, 
                      QuizQuestionRepository questionRepository,
                      UserQuizScoreRepository scoreRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.scoreRepository = scoreRepository;
    }

    public List<QuizResponse> getAllQuizzes() {
        List<Quiz> quizzes = quizRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        return quizzes.stream()
                .map(this::mapToQuizResponse)
                .collect(Collectors.toList());
    }

    public QuizResponse getQuizById(UUID quizId, boolean includeAnswers) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quiz"));

        if (!quiz.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz không còn hoạt động");
        }

        List<QuizQuestion> questions = questionRepository.findByQuizOrderByOrderNumberAsc(quiz);
        
        List<QuizQuestionResponse> questionResponses = questions.stream()
                .map(q -> QuizQuestionResponse.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .build())
                .collect(Collectors.toList());

        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .difficulty(quiz.getDifficulty())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .questionCount(questions.size())
                .questions(questionResponses)
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    @Transactional
    public QuizScoreResponse submitQuiz(User user, QuizSubmitRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quiz"));

        List<QuizQuestion> questions = questionRepository.findByQuizOrderByOrderNumberAsc(quiz);
        
        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz không có câu hỏi");
        }

        // Kiểm tra xem user đã làm quiz này chưa (nếu cần chỉ cho phép làm 1 lần)
        // if (scoreRepository.existsByUserAndQuiz(user, quiz)) {
        //     throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn đã làm quiz này rồi");
        // }

        // Chấm điểm
        int correctAnswers = 0;
        for (QuizQuestion question : questions) {
            String userAnswer = request.getAnswers().get(question.getId());
            if (question.getCorrectAnswer().equalsIgnoreCase(userAnswer)) {
                correctAnswers++;
            }
        }

        int totalQuestions = questions.size();
        BigDecimal percentage = BigDecimal.valueOf(correctAnswers)
                .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        // Lưu kết quả
        UserQuizScore score = UserQuizScore.builder()
                .user(user)
                .quiz(quiz)
                .score(correctAnswers)
                .totalQuestions(totalQuestions)
                .percentage(percentage)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .build();

        UserQuizScore saved = scoreRepository.save(score);

        return QuizScoreResponse.builder()
                .id(saved.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .score(saved.getScore())
                .totalQuestions(saved.getTotalQuestions())
                .percentage(saved.getPercentage())
                .timeTakenSeconds(saved.getTimeTakenSeconds())
                .completedAt(saved.getCompletedAt())
                .build();
    }

    public List<QuizScoreResponse> getUserQuizScores(User user) {
        List<UserQuizScore> scores = scoreRepository.findByUserOrderByCompletedAtDesc(user);
        return scores.stream()
                .map(this::mapToScoreResponse)
                .collect(Collectors.toList());
    }

    private QuizResponse mapToQuizResponse(Quiz quiz) {
        int questionCount = questionRepository.findByQuizOrderByOrderNumberAsc(quiz).size();
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .difficulty(quiz.getDifficulty())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .questionCount(questionCount)
                .questions(null) // Không load questions trong list
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    private QuizScoreResponse mapToScoreResponse(UserQuizScore score) {
        return QuizScoreResponse.builder()
                .id(score.getId())
                .quizId(score.getQuiz().getId())
                .quizTitle(score.getQuiz().getTitle())
                .score(score.getScore())
                .totalQuestions(score.getTotalQuestions())
                .percentage(score.getPercentage())
                .timeTakenSeconds(score.getTimeTakenSeconds())
                .completedAt(score.getCompletedAt())
                .build();
    }
}

