# Tổng Hợp Các API Services Đã Kết Nối

Tài liệu này liệt kê tất cả các service đã được tạo để kết nối frontend với backend API.

## 📁 Các Service Files

### 1. `authService.js`
**Location:** `src/services/authService.js`

**Endpoints:**
- ✅ `loginUser(email, password)` - POST `/api/auth/login`
- ✅ `registerUser(email, password, fullName)` - POST `/api/auth/register`
- ✅ `loginWithGoogle(googleToken)` - POST `/api/auth/google`
- ✅ `loginWithFacebook(facebookToken)` - POST `/api/auth/facebook`
- ✅ `forgotPassword(email)` - POST `/api/auth/forgot-password`
- ✅ `resetPassword(token, newPassword, confirmPassword)` - POST `/api/auth/reset-password`

---

### 2. `userService.js`
**Location:** `src/services/userService.js`

**Endpoints:**
- ✅ `updateProfile(profileData)` - PUT `/api/users/profile`
- ✅ `deleteMyAccount()` - DELETE `/api/users/me` (FR-7.2)
- ✅ `getMyStatistics()` - GET `/api/users/me/statistics` (FR-13.1.1)

---

### 3. `aqiService.js`
**Location:** `src/services/aqiService.js`

**Endpoints:**
- ✅ `getAqiByGps(latitude, longitude)` - GET `/api/aqi?lat={lat}&lon={lon}` (FR-2.1.1)
- ✅ `checkAqiAlert(latitude, longitude, threshold)` - POST `/api/aqi/check-alert` (FR-2.2.1, FR-2.2.2)

---

### 4. `reportService.js`
**Location:** `src/services/reportService.js`

**Endpoints:**
- ✅ `createReport(reportData)` - POST `/api/reports`
- ✅ `getMyReports()` - GET `/api/reports/me` (FR-4.2.1)
- ✅ `updateReportStatus(reportId, newStatus)` - PATCH `/api/reports/{id}/status`
- ✅ `exportReportPdf()` - GET `/api/reports/export/pdf` (FR-13.1.3)

---

### 5. `chatbotService.js`
**Location:** `src/services/chatbotService.js`

**Endpoints:**
- ✅ `sendChatbotMessage(message)` - POST `/api/chatbot/message` (FR-5.1)
- ✅ `getChatHistory()` - GET `/api/chatbot/history` (FR-1.2.3, FR-5.1)

---

### 6. `locationService.js`
**Location:** `src/services/locationService.js`

**Endpoints:**
- ✅ `saveLocation(locationData)` - POST `/api/locations`
- ✅ `getSavedLocations()` - GET `/api/locations`
- ✅ `getAqiForSavedLocations()` - GET `/api/locations/aqi`

---

### 7. `postService.js`
**Location:** `src/services/postService.js`

**Endpoints:**
- ✅ `createPost(postData)` - POST `/api/posts` (FR-8.1.1)
- ✅ `getAllPosts()` - GET `/api/posts` (FR-8.1.1)
- ✅ `getPostById(postId)` - GET `/api/posts/{id}` (FR-8.1.1)
- ✅ `toggleLike(postId)` - POST `/api/posts/{id}/like` (FR-8.1.2)
- ✅ `addComment(postId, commentData)` - POST `/api/posts/{id}/comments` (FR-8.1.2)
- ✅ `getPostComments(postId)` - GET `/api/posts/{id}/comments` (FR-8.1.2)

---

### 8. `categoryService.js`
**Location:** `src/services/categoryService.js`

**Endpoints:**
- ✅ `getAllCategories()` - GET `/api/categories` (Public API)

---

## 🔐 Authentication

Tất cả các service sử dụng `fetchWithAuth` từ `src/utils/apiHelper.js` để tự động thêm JWT token vào headers cho các protected endpoints.

**Public APIs** (không cần authentication):
- `authService.js` - tất cả các endpoints
- `aqiService.getAqiByGps()` 
- `categoryService.getAllCategories()`

**Protected APIs** (cần JWT token):
- Tất cả các service khác đều sử dụng `fetchWithAuth()`

---

## 📝 Cách Sử Dụng

### Ví dụ 1: Đăng nhập và lưu token
```javascript
import { loginUser } from '../services/authService';

try {
  const authData = await loginUser('user@example.com', 'password123');
  console.log('User logged in:', authData.fullName);
  // Token đã được tự động lưu vào AsyncStorage
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Ví dụ 2: Lấy danh sách báo cáo
```javascript
import { getMyReports } from '../services/reportService';

try {
  const reports = await getMyReports();
  console.log('My reports:', reports);
} catch (error) {
  console.error('Failed to fetch reports:', error.message);
}
```

### Ví dụ 3: Tạo bài viết trong community
```javascript
import { createPost } from '../services/postService';

try {
  const post = await createPost({
    title: 'Title',
    content: 'Content here',
    // ... other fields
  });
  console.log('Post created:', post);
} catch (error) {
  console.error('Failed to create post:', error.message);
}
```

---

## ⚙️ Cấu Hình

Tất cả các service sử dụng `API_BASE_URL` từ `src/constants/api.js`.

**Lưu ý:** 
- Android Emulator: `http://10.0.2.2:8080/api`
- iOS Simulator: `http://localhost:8080/api`
- Thiết bị thật: Cần dùng IP máy tính hoặc ngrok tunnel

---

## 📋 Checklist Kết Nối API

- [x] Authentication APIs (login, register, OAuth, password reset)
- [x] User APIs (profile, statistics, delete account)
- [x] AQI APIs (get AQI, check alert)
- [x] Report APIs (create, list, export PDF)
- [x] Chatbot APIs (message, history)
- [x] Location APIs (save, list, get AQI)
- [x] Post APIs (create, list, like, comment)
- [x] Category APIs (list categories)

---

## 🚀 Next Steps

Các service đã sẵn sàng để sử dụng trong components. Chỉ cần import và gọi các hàm tương ứng.

**Ví dụ trong component:**
```javascript
import React, { useEffect, useState } from 'react';
import { getMyReports } from '../services/reportService';

const ReportsScreen = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getMyReports();
      setReports(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // ... your component JSX
  );
};
```

