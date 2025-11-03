import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Gửi câu hỏi đến chatbot (FR-5.1)
 * POST /api/chatbot/message
 */
export const sendChatbotMessage = async (message) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi gửi tin nhắn' }));
        throw new Error(errorDetail.message || 'Không thể gửi tin nhắn đến chatbot.');
    }

    return response.json();
};

/**
 * Lấy lịch sử chat của user hiện tại (FR-1.2.3, FR-5.1)
 * GET /api/chatbot/history
 */
export const getChatHistory = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/chatbot/history`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy lịch sử chat' }));
        throw new Error(errorDetail.message || 'Không thể lấy lịch sử chat.');
    }

    return response.json();
};

