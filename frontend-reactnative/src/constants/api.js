import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Tự động lấy IP của máy đang chạy Expo (Host URI)
// Cách này giúp bạn không cần sửa IP thủ công trong code
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
const localhost = debuggerHost?.split(':')[0] || 'localhost';

let API_BASE_URL;

if (Platform.OS === 'android') {
  // Với Android Emulator, localhost là 10.0.2.2
  // Với thiết bị thật, ta dùng IP LAN lấy được từ debuggerHost
  API_BASE_URL = Constants.isDevice 
    ? `http://${localhost}:8080/api`
    : 'http://10.0.2.2:8080/api';
} else {
  // iOS hoặc Web
  API_BASE_URL = `http://${localhost}:8080/api`;
}

// In ra để kiểm tra IP có đúng không
console.log('🔗 API URL:', API_BASE_URL);

export { API_BASE_URL };