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

/**
 * Lấy dữ liệu AQI cho tất cả các địa điểm đã lưu của người dùng. (FR-2.1.2)
 * Protected API - cần authentication
 * @returns {Promise<SavedLocationAqiResponse[]>}
 */
export const getAqiForSavedLocations = async () => {
  // Endpoint này tương ứng với getAqiForSavedLocations trong AqiController.java
  const url = `${API_BASE_URL}/aqi/saved-locations`;
  
  // Sử dụng fetchWithAuth vì đây là API cần đăng nhập
  const response = await fetchWithAuth(url, {
    method: 'GET',
  });

  // --- BẮT ĐẦU SỬA: Xử lý trường hợp 204 No Content ---
  if (response.status === 204) {
      return []; // Trả về mảng rỗng ngay lập tức, KHÔNG gọi .json()
  }
  // --- KẾT THÚC SỬA ---

  if (!response.ok) {
    throw new Error('Không thể lấy dữ liệu AQI cho các địa điểm đã lưu.');
  }

  return response.json(); // Trả về một mảng SavedLocationAqiResponse
};