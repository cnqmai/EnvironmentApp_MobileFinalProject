import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

// Gửi tin nhắn (kèm sessionId nếu có)
export const sendChatbotMessage = async (message, sessionId = null) => {
    const body = { message };
    if (sessionId) body.sessionId = sessionId;

    const response = await fetchWithAuth(`${API_BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Lỗi gửi tin nhắn');
    return response.json();
};

// Lấy danh sách các cuộc hội thoại
export const getChatSessions = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/chatbot/sessions`, { method: 'GET' });
    if (!response.ok) throw new Error('Lỗi lấy danh sách hội thoại');
    return response.json();
};

// Lấy chi tiết tin nhắn của 1 hội thoại
export const getSessionMessages = async (sessionId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/chatbot/session/${sessionId}`, { method: 'GET' });
    if (!response.ok) throw new Error('Lỗi tải nội dung chat');
    return response.json();
};

// Xóa hội thoại
export const deleteChatSession = async (sessionId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/chatbot/session/${sessionId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Lỗi xóa hội thoại');
    return true;
};