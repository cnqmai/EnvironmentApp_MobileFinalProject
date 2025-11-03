// Cấu hình Base URL cho API
// 
// LƯU Ý QUAN TRỌNG: Expo Tunnel chỉ tạo tunnel cho Expo dev server, KHÔNG cho backend Spring Boot
// Khi dùng Expo Go trên thiết bị thật, backend cần được truy cập qua:
// 1. IP máy tính (LAN IP) - Ví dụ: http://192.168.1.100:8080/api
// 2. Hoặc dùng ngrok/tunnel khác để expose backend
//
// CÁCH 1: Dùng IP máy tính (Khuyến nghị cho development)
// - Tìm IP máy tính: ipconfig (Windows) hoặc ifconfig (Mac/Linux)
// - Thay YOUR_COMPUTER_IP bằng IP của bạn (ví dụ: 192.168.1.100)

// CÁCH 2: Dùng ngrok để tạo tunnel cho backend
// - Cài ngrok: npm install -g ngrok hoặc download từ ngrok.com
// - Chạy: ngrok http 8080
// - Copy URL https://xxxx.ngrok.io và dùng làm API_BASE_URL

import { Platform } from 'react-native';

// ============================================
// CẤU HÌNH NÀY - Đổi IP theo máy của bạn
// ============================================
const YOUR_COMPUTER_IP = '10.7.157.24'; // IP máy tính của bạn
// Hoặc nếu dùng ngrok, thay bằng: 'https://xxxx.ngrok.io/api'

let API_BASE_URL;

// Logic chọn API Base URL:
// - Android Emulator: dùng 10.0.2.2
// - iOS Simulator: dùng localhost  
// - Thiết bị thật (Expo Go): dùng IP máy tính
// - Production: dùng IP máy tính hoặc ngrok

if (Platform.OS === 'android') {
  // Android - kiểm tra có phải emulator không
  // Emulator thường có dấu hiệu: không có một số thông tin thiết bị thật
  // Để đơn giản: luôn dùng 10.0.2.2 cho Android (hoạt động cho cả emulator và có thể cho một số thiết bị)
  // Nếu không hoạt động, đổi sang dùng IP máy tính
  API_BASE_URL = 'http://10.0.2.2:8080/api'; // Android Emulator
  
  // Nếu chạy trên thiết bị thật Android và 10.0.2.2 không hoạt động, 
  // uncomment dòng dưới và comment dòng trên:
  // API_BASE_URL = `http://${YOUR_COMPUTER_IP}:8080/api`;
} else if (Platform.OS === 'ios' && __DEV__) {
  // iOS Simulator trong dev mode - dùng localhost
  API_BASE_URL = 'http://localhost:8080/api';
} else {
  // Thiết bị thật (iOS với Expo Go) hoặc Production - dùng IP máy tính hoặc ngrok
  API_BASE_URL = `http://${YOUR_COMPUTER_IP}:8080/api`;
  // Nếu dùng ngrok, comment dòng trên và uncomment dòng dưới:
  // API_BASE_URL = 'https://xxxx.ngrok.io/api';
}

// CÓ THỂ GHI ĐÈ BẰNG BIẾN MÔI TRƯỜNG (Environment Variable)
// Để dễ thay đổi khi test, có thể set:
// API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || API_BASE_URL;

export { API_BASE_URL };

// Console log để debug
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🔧 Dev Mode:', __DEV__);

