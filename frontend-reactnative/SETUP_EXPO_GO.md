# Hướng Dẫn Cấu Hình Expo Go với Tunnel

## Tổng Quan

Khi dùng **Expo Go** với **tunnel** để chạy app trên thiết bị thật, cần lưu ý:
- Expo Tunnel chỉ tạo tunnel cho Expo dev server (Metro bundler)
- Backend Spring Boot vẫn cần được truy cập từ thiết bị

## Các Cách Kết Nối Backend

### ✅ Cách 1: Dùng IP Máy Tính (Khuyến Nghị)

**Ưu điểm:** Đơn giản, nhanh, không cần công cụ bên ngoài

**Bước 1: Tìm IP máy tính của bạn**

**Windows:**
```powershell
ipconfig
```
Tìm dòng **IPv4 Address** (ví dụ: `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
# hoặc
ip addr
```

**Bước 2: Cập nhật file `src/constants/api.js`**
```javascript
const YOUR_COMPUTER_IP = '192.168.1.100'; // Thay bằng IP của bạn
```

**Bước 3: Đảm bảo cùng mạng WiFi**
- Máy tính và điện thoại phải cùng kết nối WiFi
- Tắt firewall hoặc cho phép port 8080 nếu cần

**Bước 4: Khởi động backend**
```bash
cd backend-springboot/environment-backend
mvn spring-boot:run
```

**Bước 5: Khởi động Expo với tunnel**
```bash
cd frontend-reactnative
npx expo start --tunnel
# hoặc
npm start -- --tunnel
```

**Bước 6: Mở Expo Go trên điện thoại**
- Scan QR code từ terminal
- App sẽ tự động kết nối backend qua IP máy tính

---

### ✅ Cách 2: Dùng ngrok (Khi IP không khả dụng)

**Ưu điểm:** Hoạt động từ bất kỳ đâu, không cần cùng WiFi

**Bước 1: Cài đặt ngrok**

**Windows (PowerShell):**
```powershell
# Cài qua npm
npm install -g ngrok

# Hoặc download từ https://ngrok.com/download
```

**Mac/Linux:**
```bash
# Cài qua npm
npm install -g ngrok

# Hoặc qua Homebrew (Mac)
brew install ngrok
```

**Bước 2: Tạo tunnel cho backend**
```bash
ngrok http 8080
```

Bạn sẽ thấy output:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8080
```

**Bước 3: Cập nhật file `src/constants/api.js`**
```javascript
// Comment dòng IP máy tính
// API_BASE_URL = `http://${YOUR_COMPUTER_IP}:8080/api`;

// Uncomment và thay URL ngrok
API_BASE_URL = 'https://abc123.ngrok.io/api'; // Thay abc123 bằng URL của bạn
```

**Bước 4: Khởi động backend và Expo**
```bash
# Terminal 1: Backend
cd backend-springboot/environment-backend
mvn spring-boot:run

# Terminal 2: ngrok
ngrok http 8080

# Terminal 3: Expo
cd frontend-reactnative
npx expo start --tunnel
```

**Lưu ý:**
- URL ngrok sẽ thay đổi mỗi lần chạy (trừ khi dùng tài khoản ngrok paid)
- Nếu dùng ngrok free, cần update URL mỗi lần khởi động lại

---

### 🔧 Cách 3: Dùng Environment Variable (Tùy chọn)

Để dễ thay đổi URL khi test, có thể dùng biến môi trường:

**Tạo file `.env` trong thư mục `frontend-reactnative`:**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080/api
```

**Cài đặt dotenv:**
```bash
npm install @env
```

**Cập nhật `src/constants/api.js`:**
```javascript
import { EXPO_PUBLIC_API_URL } from '@env';

const API_BASE_URL = EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
```

---

## Kiểm Tra Kết Nối

### 1. Kiểm tra backend có chạy không
Mở trình duyệt và truy cập:
```
http://localhost:8080/api/aqi?lat=10.762622&lon=106.660172
```

Nếu thấy JSON response, backend đang chạy tốt.

### 2. Kiểm tra từ điện thoại

**Với IP máy tính:**
Mở trình duyệt trên điện thoại và truy cập:
```
http://192.168.1.100:8080/api/aqi?lat=10.762622&lon=106.660172
```
(Thay `192.168.1.100` bằng IP máy tính của bạn)

**Với ngrok:**
```
https://abc123.ngrok.io/api/aqi?lat=10.762622&lon=106.660172
```

### 3. Kiểm tra Console Log

Khi app chạy, xem console log:
```
🔗 API Base URL: http://192.168.1.100:8080/api
📱 Platform: ios
🔧 Dev Mode: true
```

---

## Troubleshooting

### ❌ Lỗi: "Network request failed" hoặc "Connection refused"

**Nguyên nhân:**
- IP không đúng
- Backend chưa chạy
- Firewall chặn port 8080
- Không cùng mạng WiFi

**Giải pháp:**
1. Kiểm tra backend có chạy không: `http://localhost:8080/api/aqi?lat=10&lon=10`
2. Kiểm tra IP máy tính: `ipconfig` / `ifconfig`
3. Kiểm tra firewall: Cho phép port 8080
4. Đảm bảo cùng WiFi

### ❌ Lỗi: "CORS policy"

**Nguyên nhân:**
- Backend chưa cấu hình CORS đúng

**Giải pháp:**
- Kiểm tra `SecurityConfig.java` đã cấu hình CORS cho phép tất cả origins (`*`)

### ❌ Lỗi: "401 Unauthorized" với protected APIs

**Nguyên nhân:**
- JWT token chưa được gửi hoặc token đã hết hạn

**Giải pháp:**
1. Đăng nhập lại để lấy token mới
2. Kiểm tra `fetchWithAuth()` có được sử dụng cho protected APIs không
3. Kiểm tra token có được lưu trong AsyncStorage không

---

## Checklist

- [ ] Backend Spring Boot đang chạy trên port 8080
- [ ] Tìm được IP máy tính hoặc setup ngrok
- [ ] Cập nhật `YOUR_COMPUTER_IP` trong `src/constants/api.js`
- [ ] Máy tính và điện thoại cùng WiFi (nếu dùng IP)
- [ ] Firewall cho phép port 8080
- [ ] Test API từ trình duyệt trên điện thoại
- [ ] Kiểm tra console log API Base URL đúng
- [ ] Cài đặt `@react-native-async-storage/async-storage`

---

## Quick Start

**Tóm tắt nhanh cho Expo Go với tunnel:**

```bash
# 1. Tìm IP máy tính
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Cập nhật IP trong src/constants/api.js
# Thay YOUR_COMPUTER_IP = '192.168.1.100'

# 3. Chạy backend
cd backend-springboot/environment-backend
mvn spring-boot:run

# 4. Chạy Expo với tunnel
cd frontend-reactnative
npx expo start --tunnel

# 5. Scan QR code bằng Expo Go trên điện thoại
```

