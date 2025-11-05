import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Lấy tất cả nhóm cộng đồng (FR-8.1.3)
 * GET /api/groups
 */
export const getAllGroups = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/groups`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy nhóm' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách nhóm.');
    }

    return response.json();
};

/**
 * Lấy nhóm theo ID (FR-8.1.3)
 * GET /api/groups/{id}
 */
export const getGroupById = async (groupId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy nhóm' }));
        throw new Error(errorDetail.message || 'Không thể lấy nhóm.');
    }

    return response.json();
};

/**
 * Tạo nhóm cộng đồng (FR-8.1.3)
 * POST /api/groups
 * @param {Object} groupData - { name, description, area, district, etc. }
 */
export const createGroup = async (groupData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi tạo nhóm' }));
        throw new Error(errorDetail.message || 'Không thể tạo nhóm.');
    }

    return response.json();
};

/**
 * Tham gia nhóm (FR-8.1.3)
 * POST /api/groups/{id}/join
 */
export const joinGroup = async (groupId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/groups/${groupId}/join`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi tham gia nhóm' }));
        throw new Error(errorDetail.message || 'Không thể tham gia nhóm.');
    }

    return response.json();
};

/**
 * Rời nhóm (FR-8.1.3)
 * POST /api/groups/{id}/leave
 */
export const leaveGroup = async (groupId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/groups/${groupId}/leave`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi rời nhóm' }));
        throw new Error(errorDetail.message || 'Không thể rời nhóm.');
    }

    return response.json();
};

