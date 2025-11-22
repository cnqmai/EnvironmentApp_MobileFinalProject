import { API_BASE_URL } from '../constants/api';
// Lưu ý: Đảm bảo import đúng fetchWithAuth từ file helper của bạn
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Xử lý lỗi API an toàn (Fix lỗi Already read)
 */
const handleApiError = async (response) => {
  try {
    // 1. Đọc text ra trước (chỉ đọc 1 lần duy nhất)
    const text = await response.text();
    
    // 2. Thử parse JSON
    try {
      const errorData = JSON.parse(text);
      
      // Ưu tiên 1: Lỗi validation từ @Valid (Spring Boot)
      if (errorData.errors) {
        // Lấy lỗi đầu tiên trong object errors
        const firstKey = Object.keys(errorData.errors)[0];
        return errorData.errors[firstKey] || 'Yêu cầu không hợp lệ';
      }
      
      // Ưu tiên 2: Lỗi có message cụ thể
      if (errorData.message) {
        return errorData.message;
      }

      // Ưu tiên 3: Lỗi dạng { error: "..." }
      if (errorData.error) {
        return errorData.error;
      }
    } catch (jsonError) {
      // Nếu không phải JSON, trả về text thô (hoặc thông báo mặc định)
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
 * Public API
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

    return response.json(); // Trả về { token, user }
  } catch (error) {
    throw error; // Ném lỗi ra để UI (màn hình Login) bắt được
  }
};

/**
 * Đăng ký người dùng mới (FR-1.1.2)
 * Public API
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

    return response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Yêu cầu reset mật khẩu (FR-1.1.3)
 * Public API
 */
export const requestPasswordReset = async (email) => {
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
};

/**
 * Reset mật khẩu bằng token (FR-1.1.3)
 * Public API
 */
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const errorMessage = await handleApiError(response);
    throw new Error(errorMessage);
  }
};

/**
 * Đăng nhập bằng Google (FR-1.2.1)
 * Public API
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
    const errorMessage = await handleApiError(response);
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Đăng nhập bằng Facebook (FR-1.2.2)
 * Public API
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