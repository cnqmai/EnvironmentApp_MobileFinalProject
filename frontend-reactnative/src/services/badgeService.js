import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy tất cả badges
 */
export const getAllBadges = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/badges`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy badges' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách badges.');
    }

    return response.json();
};

/**
 * Lấy badges của user hiện tại
 */
export const getMyBadges = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/badges/me`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy badges của bạn' }));
        throw new Error(errorDetail.message || 'Không thể lấy badges của bạn.');
    }

    return response.json();
};