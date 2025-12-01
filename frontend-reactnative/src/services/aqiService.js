import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

// API Key OpenWeatherMap (Dùng để lấy dữ liệu Chart)
const OPENWEATHER_API_KEY = "5ad9ae819b67abf939f3e0d4604bd362";

/**
 * Lấy chỉ số AQI hiện tại theo tọa độ. (FR-2.1.1)
 */
export const getAqiByGps = async (latitude, longitude) => {
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

    return response.json(); 
};

/**
 * [MỚI] Lấy dự báo AQI theo giờ từ OpenWeatherMap
 * Dùng cho biểu đồ tại màn hình Detail
 */
export const getAqiForecast = async (latitude, longitude) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.list || [];
    } catch (error) {
        console.error("Lỗi lấy dự báo AQI:", error);
        return [];
    }
};

/**
 * Kiểm tra cảnh báo AQI theo ngưỡng của người dùng. (FR-2.2.1, FR-2.2.2)
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

    return response.json(); 
};

/**
 * Lấy dữ liệu AQI cho tất cả các địa điểm đã lưu của người dùng. (FR-2.1.2)
 */
export const getAqiForSavedLocations = async () => {
  const url = `${API_BASE_URL}/aqi/saved-locations`;
  
  const response = await fetchWithAuth(url, {
    method: 'GET',
  });

  if (response.status === 204) {
      return []; 
  }

  if (!response.ok) {
    // Xử lý lỗi tuỳ ý
  }

  return response.json(); 
};