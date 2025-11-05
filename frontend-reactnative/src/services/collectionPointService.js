import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy tất cả điểm thu gom (FR-10.1.1)
 * GET /api/collection-points
 * @param {string} type - Lọc theo loại (PLASTIC, ELECTRONIC, HAZARDOUS, etc.)
 */
export const getAllCollectionPoints = async (type = null) => {
    let url = `${API_BASE_URL}/collection-points`;
    if (type) {
        url += `?type=${type}`;
    }
    
    const response = await fetchWithAuth(url, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy điểm thu gom' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách điểm thu gom.');
    }

    return response.json();
};

/**
 * Tìm điểm thu gom gần vị trí (FR-10.1.1, FR-10.1.2)
 * GET /api/collection-points/nearby
 * @param {number} latitude - Vĩ độ
 * @param {number} longitude - Kinh độ
 * @param {number} radius - Bán kính tìm kiếm (km), mặc định 10
 * @param {string} type - Lọc theo loại (optional)
 */
export const getNearbyCollectionPoints = async (latitude, longitude, radius = 10, type = null) => {
    let url = `${API_BASE_URL}/collection-points/nearby?lat=${latitude}&lon=${longitude}&radius=${radius}`;
    if (type) {
        url += `&type=${type}`;
    }
    
    const response = await fetchWithAuth(url, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi tìm điểm thu gom gần đây' }));
        throw new Error(errorDetail.message || 'Không thể tìm điểm thu gom gần đây.');
    }

    return response.json();
};

