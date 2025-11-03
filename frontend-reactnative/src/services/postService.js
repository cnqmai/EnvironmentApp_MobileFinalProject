import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Tạo bài viết trong community (FR-8.1.1)
 * POST /api/posts
 */
export const createPost = async (postData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi tạo bài viết' }));
        throw new Error(errorDetail.message || 'Không thể tạo bài viết.');
    }

    return response.json();
};

/**
 * Lấy tất cả bài viết (FR-8.1.1)
 * GET /api/posts
 */
export const getAllPosts = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy danh sách bài viết' }));
        throw new Error(errorDetail.message || 'Không thể lấy danh sách bài viết.');
    }

    return response.json();
};

/**
 * Lấy bài viết theo ID (FR-8.1.1)
 * GET /api/posts/{id}
 */
export const getPostById = async (postId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy bài viết' }));
        throw new Error(errorDetail.message || 'Không thể lấy bài viết.');
    }

    return response.json();
};

/**
 * Like/Unlike bài viết (FR-8.1.2)
 * POST /api/posts/{id}/like
 */
export const toggleLike = async (postId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi like/unlike bài viết' }));
        throw new Error(errorDetail.message || 'Không thể like/unlike bài viết.');
    }

    return response.json();
};

/**
 * Thêm bình luận vào bài viết (FR-8.1.2)
 * POST /api/posts/{id}/comments
 */
export const addComment = async (postId, commentData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi thêm bình luận' }));
        throw new Error(errorDetail.message || 'Không thể thêm bình luận.');
    }

    return response.json();
};

/**
 * Lấy bình luận của bài viết (FR-8.1.2)
 * GET /api/posts/{id}/comments
 */
export const getPostComments = async (postId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi lấy bình luận' }));
        throw new Error(errorDetail.message || 'Không thể lấy bình luận.');
    }

    return response.json();
};

