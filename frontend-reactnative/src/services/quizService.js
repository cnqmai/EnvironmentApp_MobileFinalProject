import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

export const getAllKnowledge = async (category = null) => {
    let url = `${API_BASE_URL}/knowledge`;
    if (category) {
        url += `?category=${encodeURIComponent(category)}`;
    }
    
    const response = await fetchWithAuth(url, { method: 'GET' });
    if (!response.ok) return [];
    return response.json();
};