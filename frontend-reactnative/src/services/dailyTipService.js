import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy một gợi ý ngẫu nhiên
 */
export const getRandomTip = async () => {
    // Giả sử backend có endpoint /api/tips/random
    // Nếu chưa có, bạn có thể gọi getAllTips rồi random ở client
    const response = await fetchWithAuth(`${API_BASE_URL}/tips/random`, {
        method: 'GET',
    });

    if (!response.ok) {
        // Fallback nếu chưa có API random: Lấy all rồi random
        const allResponse = await fetchWithAuth(`${API_BASE_URL}/tips`, { method: 'GET' });
        if(allResponse.ok) {
            const allTips = await allResponse.json();
            if(allTips.length > 0) {
                return allTips[Math.floor(Math.random() * allTips.length)];
            }
        }
        return null; 
    }
    return response.json();
};

/**
 * Đánh dấu đã hoàn thành hành động (nhận điểm)
 */
export const completeTip = async (tipId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/tips/${tipId}/complete`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Không thể ghi nhận hoàn thành.');
    }
    return true;
};