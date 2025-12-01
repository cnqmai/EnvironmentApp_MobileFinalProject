import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Tự động lấy IP của máy đang chạy Expo (Host URI)
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
const localhost = debuggerHost?.split(':')[0] || 'localhost';
console.log('DEBUG - isDevice:', Constants.isDevice);
console.log('DEBUG - debuggerHost:', debuggerHost);
console.log('DEBUG - localhost:', localhost);

// SỬ DỤNG ĐỊA CHỈ NÀY KHI CHẠY TRÊN THIẾT BỊ ANDROID THẬT
const PC_LAN_IP = '192.168.1.7'; 

let API_BASE_URL;

if (Platform.OS === 'android') {
  // FIX: Chúng ta buộc phải dùng IP LAN cứng khi không phải Emulator
  const isEmulatorFallback = localhost === '10.0.2.2' || localhost === 'localhost';

  API_BASE_URL = !isEmulatorFallback 
    ? `http://${PC_LAN_IP}:8080/api` // Ưu tiên dùng IP LAN cứng khi không phải Emulator
    : 'http://10.0.2.2:8080/api';    // Dùng Emulator loopback
    
  // Trong nhiều trường hợp Expo, cách an toàn nhất là dùng IP LAN cứng
  if (Constants.isDevice || localhost.includes('exp.direct')) {
      API_BASE_URL = `http://${PC_LAN_IP}:8080/api`;
  }
    
} else {
  // iOS hoặc Web
  if (Constants.isDevice || localhost.includes('exp.direct')) {
    API_BASE_URL = `http://${PC_LAN_IP}:8080/api`;
  } else {
    // Dùng localhost cho iOS Simulator hoặc Web
    API_BASE_URL = `http://${localhost}:8080/api`;
  }
}

// In ra để kiểm tra IP có đúng không
console.log('🔗 API URL (Sửa):', API_BASE_URL);

export { API_BASE_URL };