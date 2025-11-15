import { Platform } from 'react-native';

// ============================================
// CẤU HÌNH NÀY - Đổi IP theo máy của bạn
// ============================================
const YOUR_COMPUTER_IP = '192.168.1.30'; // IP máy tính của bạn

let API_BASE_URL;

// Logic chọn API Base URL:
// - Android Emulator: dùng 10.0.2.2
// - Mọi trường hợp khác (iOS, thiết bị thật): dùng IP máy tính

if (Platform.OS === 'android') {
  // Android - Mặc định dùng 10.0.2.2 cho máy ảo
  API_BASE_URL = 'http://10.0.2.2:8080/api'; // Android Emulator
  
  // NẾU BẠN DÙNG THIẾT BỊ ANDROID THẬT (KHÔNG PHẢI MÁY ẢO):
  // Hãy comment dòng trên và uncomment dòng dưới:
  // API_BASE_URL = `http://${YOUR_COMPUTER_IP}:8080/api`;

} else {
  // Thiết bị thật (iOS với Expo Go), Máy ảo iOS, hoặc Production
  // Tất cả đều có thể dùng IP máy tính
  API_BASE_URL = `http://${YOUR_COMPUTER_IP}:8080/api`;
}

// CÓ THỂ GHI ĐÈ BẰNG BIẾN MÔI TRƯỜNG (Environment Variable)
// Để dễ thay đổi khi test, có thể set:
// API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || API_BASE_URL;

export { API_BASE_URL };

// Console log để debug
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🔧 Dev Mode:', __DEV__);