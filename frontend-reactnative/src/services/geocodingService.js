import axios from 'axios';
import { API_BASE_URL } from '../constants/api'; 

// Lấy base domain không có /api/
const BASE_BASE = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

/**
 * Lấy danh sách gợi ý Geocoding từ chuỗi tìm kiếm.
 */
export const fetchGeocodingSuggestions = async (query) => {
    if (query.length < 3) {
      return [];
    }
    try {
      // Dùng endpoint không có /api/
      const response = await axios.get(`${BASE_BASE}/environmental-data/search-address`, {
        params: { query: query, limit: 5 },
        timeout: 8000
      });
      // Giả định backend trả về List<GeocodingResponse>
      return response.data;
    } catch (e) {
      console.error("Lỗi lấy gợi ý Geocoding:", e.message);
      return [];
    }
};

/**
 * Lấy tọa độ từ địa chỉ chính xác (Không dùng trong flow tạo nhóm này, nhưng giữ để hoàn chỉnh)
 */
export const geocodeAddress = async (address) => {
    try {
        const response = await axios.get(`${BASE_BASE}/environmental-data/geocode`, {
            params: { address: address },
            timeout: 10000
        });
        return response.data; 
    } catch (e) {
        console.error("Lỗi Geocoding:", e.message);
        return null;
    }
}