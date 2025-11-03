import { API_BASE_URL } from '../constants/api';

/**
 * Lấy danh sách danh mục rác (Public API)
 * GET /api/categories
 */
export const getAllCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Không thể lấy danh sách danh mục.');
    }

    return response.json();
};

