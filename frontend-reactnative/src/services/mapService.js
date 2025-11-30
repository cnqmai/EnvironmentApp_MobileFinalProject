import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper'; 

export const getWasteCategories = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/categories`, { method: 'GET' });
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json(); 
  } catch (error) {
    throw error;
  }
};

export const getCollectionPoints = async (lat, lon, type = 'ALL') => {
  try {
    // Xây dựng tham số type
    // Nếu type là 'ALL' -> không gửi tham số type (để backend hiểu là lấy tất cả)
    // Nếu type khác -> gửi &type=PLASTIC
    const typeParam = (type === 'ALL' || !type) ? '' : `&type=${type}`;
    
    // URL: /api/collection-points/nearby?lat=...&lon=...&type=...
    const url = `${API_BASE_URL}/collection-points/nearby?lat=${lat}&lon=${lon}${typeParam}`;

    const response = await fetchWithAuth(url, { method: 'GET' });
    
    if (!response.ok) throw new Error("Failed to fetch collection points");
    return response.json(); 
  } catch (error) {
    console.error("Error fetching collection points:", error);
    return [];
  }
};