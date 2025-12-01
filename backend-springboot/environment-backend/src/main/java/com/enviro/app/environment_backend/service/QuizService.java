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
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
                        .correctAnswer(includeAnswers ? q.getCorrectAnswer() : null)
                        .explanation(includeAnswers ? q.getExplanation() : null)
                        .orderNumber(q.getOrderNumber())
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
        // 1. Kiểm tra Quiz tồn tại
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quiz"));

        // 2. Lấy danh sách câu hỏi
        List<QuizQuestion> questions = questionRepository.findByQuizOrderByOrderNumberAsc(quiz);
        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz không có câu hỏi");
        }

        // 3. Lấy câu trả lời (xử lý null)
        Map<UUID, String> userAnswers = request.getAnswers();
        if (userAnswers == null) {
            userAnswers = new HashMap<>();
        }

        // 4. Chấm điểm
        int correctAnswers = 0;
        for (QuizQuestion question : questions) {
            String userAnswer = userAnswers.get(question.getId());
            if (question.getCorrectAnswer() != null && 
                question.getCorrectAnswer().equalsIgnoreCase(userAnswer)) {
                correctAnswers++;
            }
        }

        // 5. Tính phần trăm
        int totalQuestions = questions.size();
        BigDecimal percentage = BigDecimal.ZERO;
        if (totalQuestions > 0) {
            percentage = BigDecimal.valueOf(correctAnswers)
                    .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        
        int timeTaken = request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 0;

        // 6. [QUAN TRỌNG] Kiểm tra xem đã có kết quả chưa để UPDATE thay vì INSERT
        Optional<UserQuizScore> existingScoreOpt = scoreRepository.findByUserAndQuiz(user, quiz);
        
        UserQuizScore scoreToSave;
        
        if (existingScoreOpt.isPresent()) {
            // -- CẬP NHẬT KẾT QUẢ CŨ --
            scoreToSave = existingScoreOpt.get();
            scoreToSave.setScore(correctAnswers);
            scoreToSave.setPercentage(percentage);
            scoreToSave.setTimeTakenSeconds(timeTaken);
            scoreToSave.setCompletedAt(OffsetDateTime.now());
            // Có thể cộng dồn điểm cho User vào bảng User nếu muốn, nhưng ở đây ta chỉ update log
        } else {
            // -- TẠO MỚI --
            scoreToSave = UserQuizScore.builder()
                    .user(user)
                    .quiz(quiz)
                    .score(correctAnswers)
                    .totalQuestions(totalQuestions)
                    .percentage(percentage)
                    .timeTakenSeconds(timeTaken)
                    .completedAt(OffsetDateTime.now())
                    .build();
        }

        // Lưu vào DB (save sẽ tự động Update nếu object đã có ID, Insert nếu chưa)
        UserQuizScore saved = scoreRepository.save(scoreToSave);

        return mapToScoreResponse(saved);
    }

    public List<QuizScoreResponse> getUserQuizScores(User user) {
        List<UserQuizScore> scores = scoreRepository.findByUserOrderByCompletedAtDesc(user);
        return scores.stream()
                .map(this::mapToScoreResponse)
                .collect(Collectors.toList());
    }

    private QuizResponse mapToQuizResponse(Quiz quiz) {
        // Đếm số câu hỏi
        int questionCount = questionRepository.countByQuizId(quiz.getId());
        
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .difficulty(quiz.getDifficulty())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .questionCount(questionCount)
                .questions(null)
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