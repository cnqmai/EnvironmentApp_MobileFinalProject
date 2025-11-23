import { Platform } from 'react-native';

// ============================================
// CẤU HÌNH NÀY - Đổi IP theo máy của bạn
// ============================================
// Dựa trên ipconfig bạn cung cấp: Wireless LAN adapter Wi-Fi
// Sửa .30 thành .3
const YOUR_COMPUTER_IP = '192.168.1.3';

let API_BASE_URL;

// Logic chọn API Base URL:
// - Android Emulator: dùng 10.0.2.2 (Loopback của máy ảo Android)
// - Mọi trường hợp khác (iOS, thiết bị thật Android, Simulator iOS): dùng IP máy tính

if (Platform.OS === 'android') {
  // Nếu đang chạy trên máy ảo Android (Android Studio Emulator)
  // API_BASE_URL = 'http://10.0.2.2:8080/api'; 
  
  // Nếu bạn đang chạy trên ĐIỆN THOẠI ANDROID THẬT:
  // (Vì dải IP 172.20.10.x thường là Hotspot, nên thiết bị thật sẽ dùng IP này)
  API_BASE_URL = `http://${YOUR_COMPUTER_IP}:8080/api`;

} else {
  // Thiết bị thật (iOS với Expo Go), Máy ảo iOS, hoặc Production
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