// File: src/services/knowledgeService.js
// Lưu ý: Đường dẫn API_BASE_URL phải là ../constants/api (lùi 1 cấp từ thư mục services)
import { API_BASE_URL } from '../constants/api'; 
import { fetchWithAuth } from '../utils/apiHelper';

export const getAllKnowledge = async (category = null) => {
    let url = `${API_BASE_URL}/knowledge`;
    if (category) {
        url += `?category=${encodeURIComponent(category)}`;
    }
    
    // Thêm log để debug
    console.log("Fetching Knowledge from:", url);

    try {
        const response = await fetchWithAuth(url, { method: 'GET' });
        if (!response.ok) {
            console.warn("Knowledge API Error:", response.status);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("Knowledge Service Error:", error);
        return [];
    }
};