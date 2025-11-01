import { API_BASE_URL } from '../constants/api';
import { saveToken } from '../utils/apiHelper';

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

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
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
    });

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