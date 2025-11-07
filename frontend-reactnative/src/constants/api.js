import { Platform } from 'react-native';
import Constants from 'expo-constants';

const YOUR_COMPUTER_IP = '192.168.1.143';
let API_BASE_URL;

if (Platform.OS === 'android') {
  API_BASE_URL = `http://${YOUR_COMPUTER_IP}:8080/api`;
} else if (Platform.OS === 'ios' && !Constants.isDevice) {
  API_BASE_URL = 'http://localhost:8080/api';
} else {
  API_BASE_URL = `http://${YOUR_COMPUTER_IP}:8080/api`;
}

// ⚠️ Ghi đè luôn — ép dùng ngrok khi test trên thiết bị thật
API_BASE_URL = 'https://eructative-prodeportation-nikola.ngrok-free.dev/api';

export { API_BASE_URL };

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🔧 Dev Mode:', __DEV__);
