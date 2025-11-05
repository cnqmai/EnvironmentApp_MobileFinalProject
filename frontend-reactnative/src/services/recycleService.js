import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth, getToken } from '../utils/apiHelper';

/**
 * Nhận diện loại rác từ hình ảnh (FR-3.2.2)
 * POST /api/recycle/recognize
 * @param {FormData} formData - FormData chứa file ảnh
 */
export const recognizeWasteImage = async (imageUri) => {
    try {
        // Tạo FormData cho multipart upload
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg', // hoặc 'image/png'
            name: 'waste_image.jpg',
        });

        // Lấy token để gửi kèm
        const token = await getToken();
        const headers = {
            'Content-Type': 'multipart/form-data',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/recycle/recognize`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorDetail = await response.json().catch(() => ({ message: 'Lỗi nhận diện ảnh' }));
            throw new Error(errorDetail.message || 'Không thể nhận diện loại rác từ ảnh.');
        }

        return response.json();
    } catch (error) {
        console.error('Error recognizing waste image:', error);
        throw error;
    }
};

/**
 * Tìm kiếm hướng dẫn xử lý rác theo tên vật phẩm (FR-3.2.1)
 * GET /api/recycle/search?query=...
 * @param {string} query - Tên vật phẩm cần tìm
 */
export const searchWasteGuide = async (query) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/recycle/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi tìm kiếm' }));
        throw new Error(errorDetail.message || 'Không thể tìm kiếm hướng dẫn.');
    }

    return response.json();
};

