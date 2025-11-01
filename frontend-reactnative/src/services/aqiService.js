import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy chỉ số AQI hiện tại theo tọa độ. (FR-2.1.1)
 * Public API - không cần authentication
 * @returns {Promise<AqiResponse>}
 */
export const getAqiByGps = async (latitude, longitude) => {
    // Xây dựng URL với tham số query
    const url = `${API_BASE_URL}/aqi?lat=${latitude}&lon=${longitude}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu AQI. Vui lòng thử lại.');
    }

    return response.json(); // Trả về AqiResponse DTO
};

/**
 * Kiểm tra cảnh báo AQI theo ngưỡng của người dùng. (FR-2.2.1, FR-2.2.2)
 * Protected API - cần authentication
 * @returns {Promise<AqiAlertResponse>}
 */
export const checkAqiAlert = async (latitude, longitude, threshold) => {
    const url = `${API_BASE_URL}/aqi/check-alert`;
    
    const response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude, threshold }),
    });

    if (!response.ok) {
        throw new Error('Lỗi khi kiểm tra cảnh báo AQI.');
    }

    return response.json(); // Trả về AqiAlertResponse DTO
};