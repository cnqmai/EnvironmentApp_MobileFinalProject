import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy tất cả bài viết kiến thức (FR-11.1.1)
 * GET /api/knowledge
 * @param {string} category - Lọc theo category (optional)
 * @param {string} type - Lọc theo loại (ARTICLE, VIDEO, INFOGRAPHIC) (optional)
 * @param {string} search - Tìm kiếm theo từ khóa (optional) [MỚI]
 */
export const getAllKnowledge = async (category = null, type = null, search = null) => {
    let url = `${API_BASE_URL}/knowledge`;
    const params = [];
    
    // [MỚI] Thêm tham số tìm kiếm nếu có
    if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
    }
    
    if (category) {
        params.push(`category=${category}`);
    }
    
    if (type) {
        params.push(`type=${type}`);
    }
    
    // Ghép các tham số vào URL
    if (params.length > 0) {
        url += `?${params.join('&')}`;
    }
    
    const response = await fetchWithAuth(url, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy danh sách bài viết' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách bài viết.');
    }

    return response.json();
};

/**
 * Lấy bài viết chi tiết theo ID (FR-11.1.1)
 * GET /api/knowledge/{id}
 */
export const getKnowledgeById = async (knowledgeId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/knowledge/${knowledgeId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy bài viết' }));
        throw new Error(errorDetail.message || 'Không thể lấy bài viết.');
    }

    return response.json();
};