import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy tất cả phần thưởng
 */
export const getAllRewards = async (type = null) => {
    let url = `${API_BASE_URL}/rewards`;
    if (type) {
        url += `?type=${type}`;
    }
    
    const response = await fetchWithAuth(url, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy phần thưởng' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách phần thưởng.');
    }

    return response.json();
};

/**
 * Đổi điểm lấy phần thưởng
 */
export const redeemReward = async (rewardId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/rewards/redeem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rewardId }),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi đổi phần thưởng' }));
        throw new Error(errorDetail.message || 'Không thể đổi phần thưởng.');
    }

    return response.json();
};

/**
 * Lấy phần thưởng đã đổi của user
 */
export const getMyRewards = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/rewards/me`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy phần thưởng đã đổi' }));
        throw new Error(errorDetail.message || 'Không thể lấy phần thưởng đã đổi.');
    }

    return response.json();
};