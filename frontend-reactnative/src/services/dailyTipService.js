import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

// URL cơ sở chính xác là /api/daily-tips

/**
 * Lấy tất cả các mẹo (Cho mục đích liệt kê/fallback)
 */
export const getAllTips = async () => {
    // Đường dẫn chính xác: /api/daily-tips
    const response = await fetchWithAuth(`${API_BASE_URL}/daily-tips`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Không thể tải danh sách mẹo.');
    }
    return response.json();
};


/**
 * Lấy Mẹo hôm nay (Sử dụng endpoint /today)
 */
export const getDailyTip = async () => {
    // Đường dẫn chính xác: /api/daily-tips/today
    const response = await fetchWithAuth(`${API_BASE_URL}/daily-tips/today`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Không có mẹo hôm nay.');
    }
    return response.json();
};

/**
 * Đánh dấu đã hoàn thành hành động và nhận điểm thưởng.
 * CHỈ SỬ DỤNG USER ID TRONG URL: POST /api/daily-tips/{userId}/claim
 * * @param {string} userId - ID của người dùng đang yêu cầu claim.
 */
export const claimDailyTipReward = async (userId) => {
    // Sửa đường dẫn để khớp với DailyTipController.java: POST /api/daily-tips/{userId}/claim
    const response = await fetchWithAuth(`${API_BASE_URL}/daily-tips/${userId}/claim`, {
        method: 'POST',
    });

    if (response.status === 403) {
        // Xử lý lỗi Forbidden (đã claim hôm nay), khớp với logic trong DailyTipService
        const errorBody = await response.json();
        throw new Error(errorBody.message || 'Bạn đã nhận thưởng cho mẹo hôm nay rồi. Thử lại vào ngày mai.');
    }

    if (!response.ok) {
        throw new Error('Không thể ghi nhận hoàn thành và nhận thưởng.');
    }
    // Backend trả về DailyTipResponse sau khi cộng điểm
    return response.json(); 
};