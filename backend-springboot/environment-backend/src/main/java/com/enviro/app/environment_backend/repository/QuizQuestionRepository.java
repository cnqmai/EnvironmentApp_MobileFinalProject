package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.Quiz;
import com.enviro.app.environment_backend.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {
    // Lấy danh sách câu hỏi theo Quiz, sắp xếp theo thứ tự
    List<QuizQuestion> findByQuizOrderByOrderNumberAsc(Quiz quiz);
    
    // --- HÀM MỚI CẦN THÊM (để sửa lỗi countByQuizId undefined) ---
    int countByQuizId(UUID quizId);
}