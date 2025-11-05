import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy gợi ý hôm nay (FR-11.1.3)
 * GET /api/daily-tips/today
 */
export const getTodayTip = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/daily-tips/today`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy gợi ý hôm nay' }));
        throw new Error(errorDetail.message || 'Không thể lấy gợi ý hôm nay.');
    }

    return response.json();
};

/**
 * Lấy tất cả gợi ý (FR-11.1.3)
 * GET /api/daily-tips
 * @param {string} category - Lọc theo category (energy, waste, water, etc.)
 */
export const getAllDailyTips = async (category = null) => {
    let url = `${API_BASE_URL}/daily-tips`;
    if (category) {
        url += `?category=${category}`;
    }
    
    const response = await fetchWithAuth(url, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy gợi ý' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách gợi ý.');
    }

    return response.json();
};

