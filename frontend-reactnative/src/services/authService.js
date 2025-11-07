import { API_BASE_URL } from '../constants/api';
import { saveToken } from '../utils/apiHelper';

export const loginUser = async (email, password) => {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
    } catch (e) {
        throw new Error('Không thể kết nối tới máy chủ xác thực. Kiểm tra mạng/Wi‑Fi và API_BASE_URL.');
    }

    if (!response.ok) {
        // Lấy thông báo lỗi từ Spring Boot (nếu có ResponseStatusException)
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi đăng nhập không xác định' }));
        throw new Error(errorDetail.message || 'Sai Email hoặc Mật khẩu.');
    }

    const data = await response.json();
    
    // Lưu JWT Token vào AsyncStorage
    if (data.token) {
        await saveToken(data.token);
        console.log("Login Successful, token saved:", data.token);
    }
    
    return data; // Trả về AuthResponse: { userId, email, fullName, token, expires, ... }
};

export const registerUser = async (email, password, fullName) => {
    const url = `${API_BASE_URL}/auth/register`;
    console.log("🔗 Gửi request đến:", url);
    
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
    } catch (e) {
      console.error("❌ Không thể kết nối tới:", url, e);
      throw new Error('Không thể kết nối tới máy chủ đăng ký. Kiểm tra mạng/Wi-Fi và API_BASE_URL.');
    }
  
    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi đăng ký không xác định' }));
        throw new Error(errorDetail.message || 'Email đã tồn tại hoặc dữ liệu không hợp lệ.');
    }

    const data = await response.json();
    
    // Lưu JWT Token vào AsyncStorage
    if (data.token) {
        await saveToken(data.token);
        console.log("Registration Successful, token saved:", data.token);
    }
    
    return data; // Trả về AuthResponse
};

/**
 * Đăng nhập bằng Google OAuth2
 * POST /api/auth/google
 */
export const loginWithGoogle = async (googleToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi đăng nhập Google' }));
        throw new Error(errorDetail.message || 'Không thể đăng nhập bằng Google.');
    }

    const data = await response.json();
    
    // Lưu JWT Token vào AsyncStorage
    if (data.token) {
        await saveToken(data.token);
        console.log("Google Login Successful, token saved:", data.token);
    }
    
    return data;
};

/**
 * Đăng nhập bằng Facebook OAuth2
 * POST /api/auth/facebook
 */
export const loginWithFacebook = async (facebookToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/facebook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: facebookToken }),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Lỗi đăng nhập Facebook' }));
        throw new Error(errorDetail.message || 'Không thể đăng nhập bằng Facebook.');
    }

    const data = await response.json();
    
    // Lưu JWT Token vào AsyncStorage
    if (data.token) {
        await saveToken(data.token);
        console.log("Facebook Login Successful, token saved:", data.token);
    }
    
    return data;
};

/**
 * Yêu cầu reset mật khẩu
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const errorDetail = await response.text().catch(() => 'Lỗi yêu cầu reset mật khẩu');
        throw new Error(errorDetail || 'Không thể gửi yêu cầu reset mật khẩu.');
    }

    return response.text(); // Trả về message
};

/**
 * Reset mật khẩu với token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (token, newPassword, confirmPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            token, 
            newPassword, 
            confirmPassword 
        }),
    });

    if (!response.ok) {
        const errorDetail = await response.text().catch(() => 'Lỗi reset mật khẩu');
        throw new Error(errorDetail || 'Không thể reset mật khẩu.');
    }

    return response.text(); // Trả về message
};