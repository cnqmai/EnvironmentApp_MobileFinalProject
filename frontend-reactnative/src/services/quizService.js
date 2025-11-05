import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy tất cả quiz (FR-11.1.2)
 * GET /api/quizzes
 */
export const getAllQuizzes = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/quizzes`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy quiz' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách quiz.');
    }

    return response.json();
};

/**
 * Lấy quiz theo ID (FR-11.1.2)
 * GET /api/quizzes/{id}
 */
export const getQuizById = async (quizId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/quizzes/${quizId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy quiz' }));
        throw new Error(errorDetail.message || 'Không thể lấy quiz.');
    }

    return response.json();
};

/**
 * Nộp bài quiz (FR-11.1.2)
 * POST /api/quizzes/submit
 * @param {string} quizId - ID quiz
 * @param {Array} answers - Mảng câu trả lời [{questionId, answerId}, ...]
 */
export const submitQuiz = async (quizId, answers) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/quizzes/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quizId, answers }),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi nộp bài quiz' }));
        throw new Error(errorDetail.message || 'Không thể nộp bài quiz.');
    }

    return response.json();
};

/**
 * Lấy kết quả quiz của user
 * GET /api/quizzes/me/scores
 */
export const getMyQuizScores = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/quizzes/me/scores`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy kết quả quiz' }));
        throw new Error(errorDetail.message || 'Không thể lấy kết quả quiz.');
    }

    return response.json();
};

