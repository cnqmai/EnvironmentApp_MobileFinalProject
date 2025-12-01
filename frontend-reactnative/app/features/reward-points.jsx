import { API_BASE_URL } from '../../src/constants/api';
import { fetchWithAuth } from '../../src/utils/apiHelper';

/**
 * Lấy danh sách tất cả quà tặng
 * GET /api/rewards
 */
export const getAllRewards = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/rewards`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Không thể tải danh sách quà tặng.');
    }
    return response.json();
};

/**
 * Đổi quà
 * POST /api/rewards/{id}/redeem
 */
export const redeemReward = async (rewardId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/rewards/${rewardId}/redeem`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Đổi quà thất bại.');
    }
    return response.text(); // Trả về message string
};

/**
 * Lấy lịch sử đổi quà
 * GET /api/rewards/history
 */
export const getRewardHistory = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/rewards/history`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Không thể tải lịch sử đổi quà.');
    }
    return response.json();
};