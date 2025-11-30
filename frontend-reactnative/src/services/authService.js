import { API_BASE_URL } from '../constants/api';
import { saveToken } from '../utils/apiHelper';

/**
 * Xử lý lỗi API an toàn
 */
const handleApiError = async (response) => {
  try {
    const text = await response.text();
    try {
      const errorData = JSON.parse(text);
      
      if (errorData.errors) {
        const firstKey = Object.keys(errorData.errors)[0];
        return errorData.errors[firstKey] || 'Yêu cầu không hợp lệ';
      }
      
      if (errorData.message) {
        return errorData.message;
      }
      
      if (errorData.error) {
        return errorData.error;
      }
    } catch (jsonError) {
      return text || `Lỗi máy chủ (${response.status})`;
    }

    return 'Đã xảy ra lỗi không xác định';
  } catch (e) {
    console.error("Lỗi xử lý phản hồi API:", e);
    return 'Không thể kết nối đến máy chủ';
  }
};

/**
 * Đăng nhập người dùng (FR-1.1.1)
 * Lưu ý: Nếu tài khoản chưa kích hoạt (enabled=false), API trả về 403.
 * Hàm handleApiError sẽ bắt được message: "Tài khoản chưa được kích hoạt..."
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.token) {
        await saveToken(data.token);
    }

    return data; 
  } catch (error) {
    throw error;
  }
};

/**
 * Đăng ký người dùng mới
 * Backend trả về String thông báo, nên dùng response.text() thay vì json()
 */
export const register = async (fullName, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response);
      throw new Error(errorMessage);
    }

    // [SỬA QUAN TRỌNG]: Backend trả về text, không phải JSON
    return response.text(); 
  } catch (error) {
    throw error;
  }
};

/**
 * Gửi yêu cầu quên mật khẩu (gửi email)
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response);
      throw new Error(errorMessage);
    }

    return response.text();
  } catch (error) {
    throw error;
  }
};

/**
 * Đặt lại mật khẩu mới với token
 */
export const resetPassword = async (token, newPassword, confirmPassword) => {
  try {
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
      const errorMessage = await handleApiError(response);
      throw new Error(errorMessage);
    }

    return response.text();
  } catch (error) {
    throw error;
  }
};

/**
 * Đăng nhập bằng Google (FR-1.1.1)
 */
export const loginWithGoogle = async (idToken) => {
  console.log('loginWithGoogle: sending ID token to', `${API_BASE_URL}/auth/google`);
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: idToken }),
  });

  if (!response.ok) {
    const errorMessage = await handleApiError(response);
    throw new Error(errorMessage);
  }
  const data = await response.json();
  console.log('loginWithGoogle: server response', data);
  return data;
};

/**
 * Đăng nhập bằng Facebook (FR-1.1.1)
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
    const errorMessage = await handleApiError(response);
    throw new Error(errorMessage);
  }

  return response.json();
};