import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Gửi ảnh lên Server để nhận diện loại rác (API THẬT)
 * POST /api/recycle/identify
 * @param {string} imageUri - Đường dẫn ảnh trên thiết bị
 */
export const identifyWaste = async (imageUri) => {
    // 1. Tạo FormData để upload file
    const formData = new FormData();
    formData.append('file', {
        uri: imageUri,
        name: 'recycle_waste.jpg', // Tên file
        type: 'image/jpeg',        // Loại file
    });

    // 2. Gọi API Upload (Multipart)
    // Lưu ý: fetchWithAuth cần hỗ trợ upload hoặc dùng fetch thường nếu header khác biệt
    // Ở đây ta dùng fetchWithAuth và để nó tự xử lý token, nhưng cần lưu ý Content-Type
    
    // Nếu fetchWithAuth của bạn tự động thêm 'Content-Type': 'application/json',
    // thì khi upload file cần ghi đè hoặc dùng fetch riêng.
    // Dưới đây là cách an toàn nhất dùng fetchWithAuth tuỳ biến:
    
    const response = await fetchWithAuth(`${API_BASE_URL}/recycle/identify`, {
        method: 'POST',
        // Không set Content-Type thủ công để browser/engine tự set multipart/form-data boundary
        headers: {
            // 'Content-Type': 'multipart/form-data', // Đừng uncomment dòng này, để tự động
        },
        body: formData,
    }, true); // Tham số thứ 3 là isFileUpload (nếu utils/apiHelper có hỗ trợ) 
              // Hoặc bạn có thể dùng fetch trực tiếp kèm token lấy từ AsyncStorage

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Lỗi nhận diện hình ảnh.');
    }

    // 3. Trả về kết quả JSON từ Server
    // Server cần trả về format: { label: "...", type: "...", guideline: "..." }
    return response.json();
};

/**
 * Xác nhận đã phân loại đúng để nhận điểm
 * POST /api/recycle/confirm
 */
export const confirmRecycleAction = async (wasteType) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/recycle/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wasteType }),
    });

    if (!response.ok) {
        throw new Error('Không thể cộng điểm.');
    }

    return response.json();
};