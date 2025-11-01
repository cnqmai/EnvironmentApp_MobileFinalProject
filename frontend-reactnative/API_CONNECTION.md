# Hướng Dẫn Kết Nối API Giữa Backend và Frontend

## Tổng Quan

Backend Spring Boot chạy trên `http://localhost:8080` và Frontend React Native kết nối qua API endpoints.

## Cấu Hình

### 1. Backend (Spring Boot)
- **Port**: 8080
- **Base URL**: `http://localhost:8080/api`
- **CORS**: Đã cấu hình cho phép tất cả origins (`*`)

### 2. Frontend (React Native)

#### API Base URL
File: `src/constants/api.js`

**⚠️ LƯU Ý QUAN TRỌNG VỀ EXPO GO VÀ TUNNEL:**
- Expo Tunnel chỉ tạo tunnel cho **Expo dev server** (Metro bundler), KHÔNG cho backend Spring Boot
- Khi dùng Expo Go trên thiết bị thật, backend Spring Boot vẫn cần truy cập được từ thiết bị

**Cấu hình theo môi trường:**
- **Android Emulator**: `http://10.0.2.2:8080/api` (dùng 10.0.2.2 thay cho localhost)
- **iOS Simulator**: `http://localhost:8080/api`
- **Thiết bị thật (Expo Go)**: Cần dùng **IP máy tính** hoặc **ngrok tunnel**

**Cách 1: Dùng IP máy tính (Khuyến nghị)**
1. Tìm IP máy tính:
   - Windows: `ipconfig` → tìm IPv4 Address (ví dụ: 192.168.1.100)
   - Mac/Linux: `ifconfig` hoặc `ip addr`
2. Cập nhật `YOUR_COMPUTER_IP` trong `src/constants/api.js`
3. Đảm bảo máy tính và điện thoại cùng mạng WiFi

**Cách 2: Dùng ngrok (Khi IP không khả dụng)**
1. Cài ngrok: `npm install -g ngrok` hoặc download từ ngrok.com
2. Chạy ngrok: `ngrok http 8080`
3. Copy URL (ví dụ: `https://abc123.ngrok.io`)
4. Cập nhật `API_BASE_URL` trong code: `https://abc123.ngrok.io/api`

#### JWT Token Management
File: `src/utils/apiHelper.js`
- **saveToken(token)**: Lưu JWT token vào AsyncStorage
- **getToken()**: Lấy JWT token từ AsyncStorage
- **removeToken()**: Xóa JWT token
- **getAuthHeaders()**: Tạo headers với JWT token
- **fetchWithAuth(url, options)**: Wrapper cho fetch với authentication tự động

## API Endpoints

### Public APIs (Không cần authentication)

#### 1. Authentication
- **POST** `/api/auth/register` - Đăng ký tài khoản
- **POST** `/api/auth/login` - Đăng nhập
- **POST** `/api/auth/google` - Đăng nhập bằng Google OAuth2
- **POST** `/api/auth/facebook` - Đăng nhập bằng Facebook OAuth2
- **POST** `/api/auth/forgot-password` - Yêu cầu reset mật khẩu
- **POST** `/api/auth/reset-password` - Reset mật khẩu

#### 2. AQI (Air Quality Index)
- **GET** `/api/aqi?lat={latitude}&lon={longitude}` - Lấy chỉ số AQI theo tọa độ GPS

#### 3. Categories
- **GET** `/api/categories` - Lấy danh sách danh mục rác

### Protected APIs (Cần JWT Token trong Header)

#### 1. AQI Alerts
- **POST** `/api/aqi/check-alert` - Kiểm tra cảnh báo AQI

#### 2. User Profile
- **PUT** `/api/users/profile` - Cập nhật thông tin profile

#### 3. Locations
- **POST** `/api/locations` - Lưu vị trí mới
- **GET** `/api/locations` - Lấy danh sách vị trí đã lưu
- **GET** `/api/locations/aqi` - Lấy AQI cho tất cả vị trí đã lưu

#### 4. Reports
- **POST** `/api/reports` - Tạo báo cáo vi phạm môi trường
- **GET** `/api/reports` - Lấy danh sách báo cáo
- **PUT** `/api/reports/{id}/status` - Cập nhật trạng thái báo cáo

## Cách Sử Dụng

### 1. Public API (Không cần token)
```javascript
import { API_BASE_URL } from '../constants/api';

const response = await fetch(`${API_BASE_URL}/aqi?lat=10.762622&lon=106.660172`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. Protected API (Cần token)
```javascript
import { fetchWithAuth } from '../utils/apiHelper';

const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
  method: 'PUT',
  body: JSON.stringify({ fullName: 'New Name' }),
});
```

### 3. Authentication Flow
```javascript
import { loginUser, registerUser } from '../services/authService';

// Đăng nhập - token tự động được lưu
const authResponse = await loginUser('user@example.com', 'password123');
// Token đã được lưu vào AsyncStorage, các API sau sẽ tự động dùng token này
```

## Checklist Kết Nối

- [x] Cấu hình CORS trong backend cho phép frontend
- [x] Tạo file `src/constants/api.js` với API base URL
- [x] Tạo helper functions để quản lý JWT token
- [x] Cài đặt `@react-native-async-storage/async-storage` để lưu token
- [x] Cập nhật `authService.js` để lưu token sau login/register
- [x] Cập nhật `aqiService.js` để sử dụng `fetchWithAuth` cho protected APIs
- [ ] Test API kết nối từ frontend đến backend
- [ ] Cấu hình IP address cho thiết bị thật nếu cần

## Lưu Ý

1. **Android Emulator**: Dùng `10.0.2.2` thay cho `localhost`
2. **iOS Simulator**: Có thể dùng `localhost`
3. **Thiết bị thật**: Phải dùng IP máy tính, không dùng `localhost`
4. **JWT Token**: Tự động được lưu sau khi login/register và tự động được gửi trong headers cho protected APIs
5. **CORS**: Backend đã cấu hình để chấp nhận requests từ bất kỳ origin nào

## Cài Đặt Dependencies

```bash
cd frontend-reactnative
npm install @react-native-async-storage/async-storage
```

hoặc nếu dùng yarn:

```bash
yarn add @react-native-async-storage/async-storage
```

