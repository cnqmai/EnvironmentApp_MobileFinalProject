import axios from 'axios';
// Giả định API_BASE_URL đã được import từ constants/api
import { API_BASE_URL } from '../constants/api'; 
// Import hàm lấy token từ helper
import { getToken } from '../utils/apiHelper'; 

const BASE_URL = API_BASE_URL;

// Lấy token Bearer
const getBearerToken = async () => {
    const rawToken = await getToken(); 
    return rawToken ? `Bearer ${rawToken}` : null; 
};


// Cấu hình Axios instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để đính kèm token vào mọi request
api.interceptors.request.use(async config => {
    const token = await getBearerToken(); 

    if (token && !config.headers.Authorization) {
        config.headers.Authorization = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


// ====================================================================
// AUTH/USER API (BỔ SUNG)
// ====================================================================

/**
 * [MỚI] Lấy thông tin người dùng hiện tại từ token
 * Giả định Backend có endpoint /api/users/me (hoặc tương tự)
 */
export const fetchCurrentUser = async () => {
    // API endpoint này có thể là /api/users/me hoặc /api/user/profile
    const response = await api.get('/users/me'); 
    return response.data; // Trả về đối tượng User (có fullName, avatarUrl, etc.)
};

// ====================================================================
// POST API (CẬP NHẬT/BỔ SUNG FR-8.1.1, FR-8.1.2)
// ====================================================================

// FR-8.1.1: Tạo bài viết
export const createPost = async (payload) => {
    // POST /api/posts
    const response = await api.post('/posts', payload);
    return response.data;
};

// FR-8.1.2: Lấy Feed theo tab
export const fetchCommunityFeed = async (tab = 'all') => {
    // GET /api/posts?tab={tab}
    const response = await api.get('/posts', {
        params: { tab }
    });
    return response.data;
};

// FR-8.1.2: Thả tim/Bỏ thả tim
export const toggleLikePost = async (postId) => {
    // POST /api/posts/{id}/like
    const response = await api.post(`/posts/${postId}/like`);
    return response.data; 
};

// FR-8.1.2: Lấy chi tiết bài viết
export const fetchPostDetails = async (postId) => {
    // GET /api/posts/{id}
    const response = await api.get(`/posts/${postId}`);
    return response.data;
};

// FR-8.1.2: Lấy comments
export const fetchPostComments = async (postId) => {
    // GET /api/posts/{id}/comments
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
};

// FR-8.1.2: Thêm comment
export const addCommentToPost = async (postId, content) => {
    // POST /api/posts/{id}/comments
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
};

// ====================================================================
// GROUP API (GIỮ NGUYÊN)
// ====================================================================

export const fetchMyCommunities = async () => {
    const response = await api.get('/groups');
    return response.data;
};

export const fetchDiscoverCommunities = async (page = 0, size = 10) => {
    const response = await api.get('/groups/discover', { params: { page, size } });
    return response.data;
};

export const fetchCommunityDetails = async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
};

export const toggleJoinCommunity = async (groupId) => {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data; 
};

export const trackPostShare = async (postId) => {
    const response = await api.post(`/posts/${postId}/share`); 
    return response.data;
};