import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy tất cả thông báo của user (FR-6.1, FR-6.2, FR-6.3)
 * GET /api/notifications
 */
export const getMyNotifications = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy thông báo' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách thông báo.');
    }

    return response.json();
};

/**
 * Đánh dấu thông báo đã đọc
 * PATCH /api/notifications/{id}/read
 */
export const markNotificationAsRead = async (notificationId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi đánh dấu đã đọc' }));
        throw new Error(errorDetail.message || 'Không thể đánh dấu thông báo đã đọc.');
    }

    return response.json();
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi đánh dấu tất cả đã đọc' }));
        throw new Error(errorDetail.message || 'Không thể đánh dấu tất cả thông báo đã đọc.');
    }

    return response.json();
};

/**
 * Lấy cài đặt thông báo của user
 * GET /api/notifications/settings
 */
export const getNotificationSettings = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/settings`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy cài đặt thông báo' }));
        throw new Error(errorDetail.message || 'Không thể lấy cài đặt thông báo.');
    }

    return response.json();
};

/**
 * Cập nhật cài đặt thông báo
 * PUT /api/notifications/settings
 */
export const updateNotificationSettings = async (settings) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi cập nhật cài đặt' }));
        throw new Error(errorDetail.message || 'Không thể cập nhật cài đặt thông báo.');
    }

    return response.json();
};

