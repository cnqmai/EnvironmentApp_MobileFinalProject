import { API_BASE_URL } from '../constants/api';
// Không cần fetchWithAuth vì đây là public API, nhưng nếu bạn muốn bảo mật thì đổi thành fetchWithAuth
import { fetchWithAuth } from '../utils/apiHelper'; 

export const getAllCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Không thể lấy danh sách danh mục');
    return response.json();
};

// --- THÊM MỚI ---
export const getCategoryBySlug = async (slug) => {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Không thể lấy thông tin danh mục');
    return response.json();
};