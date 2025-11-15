import { API_BASE_URL } from '../constants/api';
import { fetchWithAuth } from '../utils/apiHelper';

/**
 * Xử lý lỗi API chung, cố gắng đọc JSON từ backend
 */
const handleApiError = async (response) => {
  try {
    const errorData = await response.json();
    
    // Lỗi validation từ @Valid
    if (errorData.errors) {
      const firstError = Object.values(errorData.errors)[0];
      return firstError || errorData.error || 'Yêu cầu không hợp lệ';
    }
    
    // Lỗi chung (ví dụ: 401 Unauthorized từ AuthController)
    if (errorData.message) {
      return errorData.message;
    }

    if (errorData.error) {
      return errorData.error;
    }

    return 'Đã xảy ra lỗi không xác định';
  } catch (e) {
    return await response.text() || 'Lỗi máy chủ';
  }
};


/**
 * Đăng nhập người dùng (FR-1.1.1)
 * Public API
 * @returns {Promise<AuthResponse>}
 */
export const login = async (email, password) => { // SỬA: 'username' -> 'email'
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // SỬA: Gửi 'email'
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorMessage = await handleApiError(response);
    throw new Error(errorMessage);
  }

  return response.json(); // Trả về { token, user }
};

/**
 * Đăng ký người dùng mới (FR-1.1.2)
 * Public API
 * @returns {Promise<User>}
 */
export const register = async (fullName, email, password) => { // SỬA: 'username' -> 'fullName'
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // SỬA: Gửi 'fullName'
    body: JSON.stringify({ fullName, email, password }),
  });

  if (!response.ok) {
    const errorMessage = await handleApiError(response);
    throw new Error(errorMessage);
  }

  return response.json(); // Trả về thông tin user đã tạo
};

/**
 * Yêu cầu reset mật khẩu (FR-1.1.3)
 * Public API
 * @returns {Promise<void>}
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
 * @returns {Promise<void>}
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
 * @returns {Promise<AuthResponse>}
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
 * @returns {Promise<AuthResponse>}
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