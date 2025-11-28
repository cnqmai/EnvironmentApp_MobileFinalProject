import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Gửi tin nhắn đến Chatbot
 * Endpoint: POST /api/chatbot/message
 */
export const sendMessageToBot = async (message) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/chatbot/message`, {
            method: 'POST',
            body: JSON.stringify({ message: message }), // Key 'message' khớp với ChatbotRequest.java
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Lỗi kết nối với Chatbot');
        }

        return response.json(); // Trả về ChatbotResponse (userQuery, botResponse...)
    } catch (error) {
        console.error("Chatbot Error:", error);
        throw error;
    }
};

/**
 * Lấy lịch sử trò chuyện
 * Endpoint: GET /api/chatbot/history
 */
export const getChatHistory = async () => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/chatbot/history`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Không thể tải lịch sử chat');
        }

        return response.json(); // Trả về List<ChatbotResponse>
    } catch (error) {
        console.error("History Error:", error);
        return []; // Trả về mảng rỗng nếu lỗi để không crash app
    }
};