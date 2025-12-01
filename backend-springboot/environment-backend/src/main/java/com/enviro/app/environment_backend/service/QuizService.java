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
import org.springframework.data.domain.Sort;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit; // Thêm import này
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
      return quizRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
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

        // === BƯỚC MỚI: KIỂM TRA GIỚI HẠN GỬI BÀI HÀNG NGÀY (PER-USER) ===
        // 1. Tính toán thời điểm bắt đầu của ngày hiện tại (00:00:00)
        // Phương thức này giữ nguyên múi giờ (offset) hiện tại của OffsetDateTime.now() 
        // và đặt giờ, phút, giây, nano giây về 0.
        OffsetDateTime startOfDay = OffsetDateTime.now()
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        Optional<UserQuizScore> existingScore = userQuizScoreRepository.findByUserAndQuiz(user, quiz);

        if (existingScore.isPresent()) {
            UserQuizScore score = existingScore.get();
            // Kiểm tra xem bài thi đã được hoàn thành sau 00:00 của ngày hôm nay chưa.
            // Việc này đảm bảo giới hạn nộp bài là 1 lần mỗi ngày cho TỪNG TÀI KHOẢN.
            if (score.getCompletedAt() != null && score.getCompletedAt().isAfter(startOfDay)) {
                // Ném ra ngoại lệ nếu người dùng đã hoàn thành bài quiz này hôm nay.
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User can only submit this quiz once per day. Try again tomorrow at 00:00.");
            }
        }
        // ==================================================================
        
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
        // existingScore đã được lấy ở bước kiểm tra phía trên
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