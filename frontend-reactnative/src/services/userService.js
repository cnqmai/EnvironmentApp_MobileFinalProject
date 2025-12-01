import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Cập nhật thông tin profile của user hiện tại
 * PUT /api/users/profile
 */
export const updateProfile = async (profileData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi cập nhật profile' }));
        throw new Error(errorDetail.message || 'Không thể cập nhật profile.');
    }

    return response.json();
};
/**
 * Xóa tài khoản của user hiện tại (FR-7.2)
 * ĐÃ CẬP NHẬT: Gửi mật khẩu xác nhận trong Body
 * DELETE /api/users/me
 */
export const deleteMyAccount = async (requestBody) => { // *** THÊM requestBody ***
    const response = await fetchWithAuth(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody), // *** GỬI BODY CHỨA MẬT KHẨU VÀ CHUỖI XÁC NHẬN ***
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi xóa tài khoản' }));
        // Backend trả về message lỗi (ví dụ: "Mật khẩu không chính xác.")
        throw new Error(errorDetail.message || 'Không thể xóa tài khoản.');
    }

    return response.text(); // Trả về message: "Tài khoản đã được xóa thành công."
};

// ===================================================================
// *** API MỚI CHO QỦYỀN RIÊNG TƯ (FR-7.3) ***
// ===================================================================

/**
 * Lấy cài đặt Quyền riêng tư hiện tại của user (FR-7.3)
 * GET /api/users/me/privacy
 */
export const getPrivacySettings = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/me/privacy`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy cài đặt quyền riêng tư' }));
        throw new Error(errorDetail.message || 'Không thể lấy cài đặt quyền riêng tư.');
    }

    return response.json();
};

/**
 * Cập nhật cài đặt Quyền riêng tư (FR-7.3)
 * PUT /api/users/me/privacy
 */
export const updatePrivacySettings = async (settingsData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/me/privacy`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi cập nhật cài đặt quyền riêng tư' }));
        throw new Error(errorDetail.message || 'Không thể cập nhật cài đặt quyền riêng tư.');
    }

    return response.json();
};

/**
 * Lấy thống kê cá nhân của user hiện tại (FR-13.1.1)
 * GET /api/users/me/statistics
 */
export const getMyStatistics = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/me/statistics`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy thống kê' }));
        throw new Error(errorDetail.message || 'Không thể lấy thống kê.');
    }

    return response.json();
};

/**
 * Lấy thông tin hồ sơ user hiện tại
 * GET /api/users/me
 */
export const getMyProfile = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/me`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy thông tin người dùng' }));
        throw new Error(errorDetail.message || 'Không thể lấy thông tin người dùng.');
    }

    return response.json();
};

/**
 * Cố gắng lấy user hiện tại qua nhiều endpoint thường gặp
 */
export const getCurrentUserFlexible = async () => {
    const tryEndpoints = [
        `${API_BASE_URL}/users/me`,
        `${API_BASE_URL}/auth/me`,
        `${API_BASE_URL}/users/profile`,
    ];

    for (const url of tryEndpoints) {
        try {
            const res = await fetchWithAuth(url, { method: 'GET' });
            if (res.ok) {
                return await res.json();
            }
        } catch (_) {}
    }

    throw new Error('Không thể lấy thông tin người dùng từ các endpoint chuẩn.');
};

// ===================================================================
// *** API MỚI CHO CỘNG ĐIỂM (FR-9.1.1) ***
// ===================================================================

/**
 * Cộng 10 điểm cho hành động phân loại rác thành công
 * POST /api/users/me/points/recycle
 */
export const addRecyclePoints = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/me/points/recycle`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi cộng điểm phân loại rác' }));
        // Không throw error để không làm hỏng flow chính, chỉ log
        console.error("Không thể cộng điểm: ", errorDetail.message || 'Lỗi không xác định.');
    }

    // Không cần trả về body, chỉ cần biết request đã được gửi
    return response.ok;
};

// ===================================================================
// *** API MỚI CHO CÀI ĐẶT THÔNG BÁO (FR-2.2.2) ***
// ===================================================================

/**
 * Lấy cài đặt thông báo hiện tại
 * GET /api/users/me/notifications
 */
export const getNotificationSettings = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/me/notifications`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy cài đặt thông báo' }));
        throw new Error(errorDetail.message || 'Không thể lấy cài đặt thông báo.');
    }

    return response.json();
};

/**
 * Cập nhật cài đặt thông báo (bao gồm ngưỡng AQI)
 * PUT /api/users/me/notifications
 */
export const updateNotificationSettings = async (settingsData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/me/notifications`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi cập nhật cài đặt thông báo' }));
        throw new Error(errorDetail.message || 'Không thể cập nhật cài đặt thông báo.');
    }

    return response.json();
};

/**
 * Lấy thống kê dashboard cộng đồng (FR-12.1.2)
 * GET /api/users/community/dashboard
 */
export const getCommunityDashboard = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/community/dashboard`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy thống kê cộng đồng' }));
        throw new Error(errorDetail.message || 'Không thể lấy thống kê cộng đồng.');
    }

    return response.json();
};