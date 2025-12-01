import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy danh sách tất cả quiz (FR-11.1.2)
 * GET /api/quizzes
 */
export const getQuizzes = async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/quizzes`, { method: 'GET' });
    if (!res.ok) throw new Error('Failed to load quizzes');
    return res.json();
};

/**
 * Lấy chi tiết quiz theo ID (bao gồm câu hỏi)
 * GET /api/quizzes/{id}
 */
export const getQuizById = async (quizId) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/quizzes/${quizId}`, { method: 'GET' });
    if (!res.ok) throw new Error('Failed to load quiz');
    return res.json();
};

/**
 * Nộp bài quiz (FR-11.1.2)
 * POST /api/quizzes/{id}/submit
 */
export const submitQuiz = async (quizId, answers, timeTakenSeconds) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            answers,
            timeTakenSeconds: timeTakenSeconds || 0
        })
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to submit quiz' }));
        throw new Error(error.message || 'Failed to submit quiz');
    }
    return res.json();
};