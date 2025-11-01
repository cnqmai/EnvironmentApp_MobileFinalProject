// Helper functions cho API calls
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@env_app_token';

/**
 * Lưu JWT token vào AsyncStorage
 */
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Lỗi khi lưu token:', error);
  }
};

/**
 * Lấy JWT token từ AsyncStorage
 */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Lỗi khi lấy token:', error);
    return null;
  }
};

/**
 * Xóa JWT token khỏi AsyncStorage
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Lỗi khi xóa token:', error);
  }
};

/**
 * Tạo headers cho API request (có JWT token nếu có)
 */
export const getAuthHeaders = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = await getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Wrapper cho fetch với authentication headers tự động
 */
export const fetchWithAuth = async (url, options = {}) => {
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  
  return response;
};

