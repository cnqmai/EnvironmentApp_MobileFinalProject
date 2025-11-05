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
 * DELETE /api/users/me
 */
export const deleteMyAccount = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorDetail = await response.text().catch(() => 'Lỗi xóa tài khoản');
        throw new Error(errorDetail || 'Không thể xóa tài khoản.');
    }

    return response.text(); // Trả về message: "Tài khoản đã được xóa thành công."
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

