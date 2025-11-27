import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';
import * as Location from 'expo-location'; // Thêm thư viện Location

/**
 * Hàm mới: Lấy địa chỉ hiện tại từ thiết bị
 * Trả về chuỗi địa chỉ (Ví dụ: "Cau Giay, Hanoi, Vietnam") hoặc null nếu thất bại
 */
export const getCurrentDeviceAddress = async () => {
    try {
        // 1. Xin quyền truy cập vị trí
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Quyền truy cập vị trí bị từ chối');
            return null;
        }

        // 2. Lấy tọa độ hiện tại
        const location = await Location.getCurrentPositionAsync({});
        
        // 3. Chuyển tọa độ thành địa chỉ (Reverse Geocoding)
        const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        });

        if (reverseGeocode.length > 0) {
            const address = reverseGeocode[0];
            // Tạo chuỗi địa chỉ từ các thành phần có sẵn, ưu tiên từ nhỏ đến lớn
            const parts = [
                address.street,                        // Tên đường
                address.subRegion || address.district, // Quận/Huyện
                address.city || address.subAdminArea,  // Thành phố
                address.region || address.adminArea,   // Tỉnh/Bang
                address.country                        // Quốc gia
            ].filter(Boolean); // Lọc bỏ các giá trị null/undefined

            // Nối các phần lại bằng dấu phẩy
            return parts.length > 0 ? parts.join(', ') : 'Vị trí không xác định';
        }
        
        return null;
    } catch (error) {
        console.error("Lỗi lấy vị trí thiết bị:", error);
        return null;
    }
};

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