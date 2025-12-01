import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Tạo báo cáo vi phạm môi trường
 * POST /api/reports
 */
export const createReport = async (reportData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi tạo báo cáo' }));
        throw new Error(errorDetail.message || 'Không thể tạo báo cáo.');
    }

    return response.json();
};

/**
 * Lấy lịch sử báo cáo của user hiện tại (FR-4.2.1)
 * GET /api/reports/me
 */
export const getMyReports = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/reports/me`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy báo cáo' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách báo cáo.');
    }

    return response.json();
};

/**
 * Cập nhật trạng thái báo cáo (Protected - cần quyền ADMIN/MODERATOR)
 * PATCH /api/reports/{id}/status
 */
export const updateReportStatus = async (reportId, newStatus) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus }),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi cập nhật trạng thái' }));
        throw new Error(errorDetail.message || 'Không thể cập nhật trạng thái báo cáo.');
    }

    return response.json();
};

/**
 * FR-12.1.3: Xuất báo cáo cộng đồng và gửi qua email
 * POST /api/reports/export/community
 * @param {object} exportData - Dữ liệu cần xuất báo cáo (community stats, reports details, etc.)
 */
export const exportCommunityReport = async (exportData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/reports/export/community`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi xuất báo cáo.' }));
        // Nếu backend trả về thông báo lỗi, dùng thông báo đó, nếu không dùng thông báo chung
        throw new Error(errorDetail.message || 'Không thể xuất báo cáo cộng đồng. Vui lòng thử lại.');
    }

    // Giả định backend trả về { success: true, email: 'user@example.com' }
    return response.json();
};