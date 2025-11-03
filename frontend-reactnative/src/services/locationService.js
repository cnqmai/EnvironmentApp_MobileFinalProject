import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lưu vị trí mới
 * POST /api/locations
 */
export const saveLocation = async (locationData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/locations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lưu vị trí' }));
        throw new Error(errorDetail.message || 'Không thể lưu vị trí.');
    }

    return response.json();
};

/**
 * Lấy danh sách vị trí đã lưu
 * GET /api/locations
 */
export const getSavedLocations = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/locations`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy danh sách vị trí' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách vị trí.');
    }

    return response.json();
};

/**
 * Lấy AQI cho tất cả các vị trí đã lưu
 * GET /api/locations/aqi
 */
export const getAqiForSavedLocations = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/locations/aqi`, {
        method: 'GET',
    });

    if (!response.ok) {
        // 204 No Content là hợp lệ khi không có vị trí nào
        if (response.status === 204) {
            return [];
        }
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy AQI cho vị trí' }));
        throw new Error(errorDetail.message || 'Không thể lấy AQI cho các vị trí đã lưu.');
    }

    return response.json();
};

