import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy danh sách tất cả các bài quiz
 * GET /api/quizzes
 */
export const getAllQuizzes = async () => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/quizzes`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorDetail = await response.json().catch(() => ({}));
            throw new Error(errorDetail.message || 'Không thể lấy danh sách quiz.');
        }

        return await response.json();
    } catch (error) {
        console.error("QuizService Error (getAllQuizzes):", error);
        throw error;
    }
};

/**
 * Lấy chi tiết một bài quiz theo ID (bao gồm danh sách câu hỏi)
 * GET /api/quizzes/{id}
 */
export const getQuizById = async (quizId) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/quizzes/${quizId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorDetail = await response.json().catch(() => ({}));
            throw new Error(errorDetail.message || 'Không thể lấy thông tin quiz.');
        }

        return await response.json();
    } catch (error) {
        console.error("QuizService Error (getQuizById):", error);
        throw error;
    }
};

/**
 * Nộp bài làm quiz để chấm điểm
 * POST /api/quizzes/submit
 * Payload: { quizId: UUID, answers: { questionId: "A" }, timeTakenSeconds: number }
 */
export const submitQuiz = async (quizId, answersMap, timeTakenSeconds = 0) => {
    try {
        // Đảm bảo gửi đúng object JSON
        const bodyPayload = {
            quizId: quizId,
            answers: answersMap || {}, // Gửi object rỗng nếu không có đáp án
            timeTakenSeconds: timeTakenSeconds
        };

        const response = await fetchWithAuth(`${API_BASE_URL}/quizzes/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyPayload),
        });

        if (!response.ok) {
            const errorDetail = await response.json().catch(() => ({}));
            // Log lỗi ra console để dễ debug nếu backend trả về 400/500
            console.error("Submit Quiz Failed:", errorDetail);
            throw new Error(errorDetail.message || 'Lỗi khi nộp bài quiz.');
        }

        return await response.json();
    } catch (error) {
        console.error("QuizService Error (submitQuiz):", error);
        throw error;
    }
};

/**
 * Lấy lịch sử điểm số của người dùng hiện tại
 * GET /api/quizzes/me/scores
 */
export const getMyQuizScores = async () => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/quizzes/me/scores`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorDetail = await response.json().catch(() => ({}));
            throw new Error(errorDetail.message || 'Không thể lấy lịch sử điểm số.');
        }

        return await response.json();
    } catch (error) {
        console.error("QuizService Error (getMyQuizScores):", error);
        throw error;
    }
};