import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

export const getQuizzes = async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/quizzes`, { method: 'GET' });
    if (!res.ok) throw new Error('Failed to load quizzes');
    return res.json();
};

export const submitQuiz = async (quizId, answers) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error('Failed to submit quiz');
    return res.json();
};