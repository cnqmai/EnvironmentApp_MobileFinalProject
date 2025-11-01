# BÁO CÁO ĐỐI CHIẾU API VỚI FUNCTIONAL REQUIREMENTS

## 📊 TỔNG QUAN

**Ngày kiểm tra:** Hôm nay  
**Tổng số FR:** 30+ yêu cầu chức năng  
**Trạng thái:** ✅ Đã có API | ⚠️ Thiếu API | 🟡 Cần Frontend xử lý | ❌ Chưa có

---

## ✅ PHẦN 1: QUẢN LÝ NGƯỜI DÙNG (8%)

### 1.1 Đăng ký / Đăng nhập

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-1.1.1** | Đăng nhập email/mật khẩu hoặc Google/Facebook | ✅ `POST /api/auth/login`<br>✅ `POST /api/auth/register`<br>✅ `POST /api/auth/google`<br>✅ `POST /api/auth/facebook` | ✅ **ĐẦY ĐỦ** |
| **FR-1.1.2** | Chế độ khách (guest mode) – dữ liệu chỉ lưu cục bộ | ❌ Không có API | ⚠️ **THIẾU** - Frontend có thể tự xử lý (AsyncStorage) |
| **FR-1.1.3** | Đặt lại mật khẩu qua email | ✅ `POST /api/auth/forgot-password`<br>✅ `POST /api/auth/reset-password` | ✅ **ĐẦY ĐỦ** |

### 1.2 Hồ sơ người dùng

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-1.2.1** | Lưu thông tin cá nhân, khu vực sinh sống mặc định | ✅ `PUT /api/users/profile` (có `defaultLocation` trong User model) | ✅ **ĐẦY ĐỦ** |
| **FR-1.2.2** | Chỉnh sửa ảnh đại diện, thông tin liên hệ | ✅ `PUT /api/users/profile` (có `avatarUrl` trong User model) | ✅ **ĐẦY ĐỦ** |
| **FR-1.2.3** | Lưu lịch sử báo cáo và câu hỏi đã gửi chatbot | ⚠️ `GET /api/reports` (chưa có endpoint lấy reports của user)<br>❌ Không có API lịch sử chatbot | ⚠️ **THIẾU MỘT PHẦN** |

**📝 Ghi chú FR-1.2.3:**
- Database đã có bảng `chatbot_history` nhưng chưa có Controller/Service
- Cần thêm `GET /api/reports/me` để lấy danh sách báo cáo của user hiện tại

---

## ✅ PHẦN 2: CẢNH BÁO CHẤT LƯỢNG KHÔNG KHÍ (12%)

### 2.1 Hiển thị chỉ số AQI

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-2.1.1** | Lấy dữ liệu AQI theo vị trí GPS hoặc vị trí đã lưu | ✅ `GET /api/aqi?lat=...&lon=...`<br>✅ `GET /api/locations/aqi` (AQI cho tất cả vị trí đã lưu) | ✅ **ĐẦY ĐỦ** |
| **FR-2.1.2** | Hiển thị mức AQI, mức độ nguy hại, màu cảnh báo, khuyến nghị | ✅ `GET /api/aqi` trả về `AqiResponse` có đầy đủ thông tin | ✅ **ĐẦY ĐỦ** |

### 2.2 Cảnh báo

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-2.2.1** | Gửi thông báo đẩy khi AQI vượt ngưỡng an toàn | ✅ `POST /api/aqi/check-alert` (có thể kiểm tra)<br>⚠️ Chưa có Push Notification Service | ⚠️ **THIẾU PUSH NOTIFICATION** |
| **FR-2.2.2** | Tùy chỉnh ngưỡng cảnh báo | ✅ `POST /api/aqi/check-alert` nhận `threshold` từ request | ✅ **ĐẦY ĐỦ** (nhưng cần lưu ngưỡng của user vào DB) |

**📝 Ghi chú:**
- Cần thêm bảng `user_aqi_settings` để lưu ngưỡng cảnh báo của từng user
- Cần tích hợp Firebase Cloud Messaging (FCM) hoặc Expo Push Notification

---

## ✅ PHẦN 3: HƯỚNG DẪN XỬ LÝ RÁC THẢI (8%)

### 3.1 Phân loại rác

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-3.1.1** | Chọn loại rác (hữu cơ, nhựa, kim loại, điện tử, y tế…) | ✅ `GET /api/categories` (lấy danh sách categories) | ✅ **ĐẦY ĐỦ** |
| **FR-3.1.2** | Hiển thị hướng dẫn xử lý, tái chế, địa điểm thu gom gần nhất | ⚠️ Có thể lấy từ `description` trong `WasteCategory`<br>❌ Không có API địa điểm thu gom | ⚠️ **THIẾU MỘT PHẦN** |

### 3.2 Tìm kiếm hướng dẫn

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-3.2.1** | Nhập tên vật phẩm để tìm hướng dẫn xử lý | ❌ Không có API search | ⚠️ **THIẾU** |
| **FR-3.2.2** | AI gợi ý phân loại dựa trên mô tả hoặc hình ảnh | ❌ Không có API AI classification | ❌ **THIẾU** |

**📝 Ghi chú:**
- Cần thêm `GET /api/categories/search?query=...`
- Cần tích hợp AI Service (OpenAI/Google Gemini) cho classification
- Cần thêm bảng `waste_collection_points` cho địa điểm thu gom

---

## ✅ PHẦN 4: BÁO CÁO VI PHẠM MÔI TRƯỜNG (12%)

### 4.1 Tạo báo cáo

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-4.1.1** | Nhập mô tả, tải ảnh/video vi phạm | ✅ `POST /api/reports` (có `description`, `media[]`) | ✅ **ĐẦY ĐỦ** |
| **FR-4.1.2** | Tự động lấy vị trí GPS hoặc chọn trên bản đồ | ✅ `POST /api/reports` (có `latitude`, `longitude`) | ✅ **ĐẦY ĐỦ** |

### 4.2 Quản lý báo cáo

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-4.2.1** | Lưu danh sách báo cáo đã gửi | ❌ Không có `GET /api/reports/me` | ⚠️ **THIẾU** |
| **FR-4.2.2** | Hiển thị trạng thái xử lý (Đã nhận – Đang xử lý – Hoàn thành) | ✅ `POST /api/reports` trả về `status`<br>✅ `PATCH /api/reports/{id}/status` (cập nhật) | ✅ **ĐẦY ĐỦ** |

**📝 Ghi chú:**
- Cần thêm `GET /api/reports/me` để lấy tất cả reports của user hiện tại

---

## ❌ PHẦN 5: CHATBOT AI VỀ MÔI TRƯỜNG (5%)

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-5.1** | Chatbot AI trả lời câu hỏi về môi trường, phân loại rác, luật bảo vệ môi trường | ❌ Không có API chatbot | ❌ **THIẾU HOÀN TOÀN** |
| **FR-5.2** | Chatbot hỗ trợ trả lời bằng văn bản hoặc giọng nói | ❌ Không có API | ❌ **THIẾU HOÀN TOÀN** |
| **FR-5.3** | Gợi ý hành động bảo vệ môi trường theo mùa, sự kiện | ❌ Không có API | ❌ **THIẾU HOÀN TOÀN** |

**📝 Ghi chú:**
- Database đã có bảng `chatbot_history` nhưng chưa có Controller/Service
- Cần tạo:
  - `POST /api/chatbot/message` - Gửi câu hỏi
  - `GET /api/chatbot/history` - Lấy lịch sử chat
  - Tích hợp AI Service (OpenAI/Google Gemini)

---

## ❌ PHẦN 6: THÔNG BÁO & TƯƠNG TÁC (5%)

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-6.1** | Gửi thông báo về chiến dịch môi trường địa phương | ❌ Không có API notifications | ❌ **THIẾU HOÀN TOÀN** |
| **FR-6.2** | Nhắc nhở lịch thu gom rác tái chế | ❌ Không có API | ❌ **THIẾU HOÀN TOÀN** |
| **FR-6.3** | Cảnh báo thời tiết ảnh hưởng đến chất lượng không khí | ❌ Không có API | ❌ **THIẾU HOÀN TOÀN** |

**📝 Ghi chú:**
- Cần tạo bảng `notifications` và `notification_settings`
- Cần tích hợp Push Notification Service
- Cần API:
  - `GET /api/notifications` - Lấy danh sách thông báo
  - `POST /api/notifications/settings` - Cấu hình thông báo
  - `PUT /api/notifications/{id}/read` - Đánh dấu đã đọc

---

## ⚠️ PHẦN 7: QUYỀN RIÊNG TƯ & BẢO MẬT (5%)

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-7.1** | Mã hóa dữ liệu người dùng | ✅ Đã dùng BCrypt cho password<br>✅ JWT cho authentication | ✅ **ĐẦY ĐỦ** (cơ bản) |
| **FR-7.2** | Xóa tài khoản và toàn bộ dữ liệu | ❌ Không có `DELETE /api/users/me` | ⚠️ **THIẾU** |
| **FR-7.3** | Không chia sẻ vị trí hoặc dữ liệu cá nhân khi chưa có sự đồng ý | 🟡 Chủ yếu là logic Frontend | 🟡 **CẦN FRONTEND XỬ LÝ** |

**📝 Ghi chú:**
- Cần thêm `DELETE /api/users/me` với cascade delete

---

## ❌ PHẦN 8: CỘNG ĐỒNG & CHIA SẺ (7%)

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-8.1.1** | Chia sẻ mẹo sống xanh (bài viết, hình ảnh, video) | ❌ Database có bảng `posts` nhưng chưa có Controller/Service | ⚠️ **THIẾU HOÀN TOÀN** |
| **FR-8.1.2** | Bình luận, thả tim và chia sẻ nội dung | ❌ Database có bảng `comments`, `likes` nhưng chưa có API | ⚠️ **THIẾU HOÀN TOÀN** |
| **FR-8.1.3** | Tạo nhóm cộng đồng theo khu vực | ❌ Không có bảng `community_groups` | ❌ **THIẾU HOÀN TOÀN** |

**📝 Ghi chú:**
- Database đã có cấu trúc nhưng Models (`Post.java`, `Comment.java`, `Like.java`) đang trống
- Cần tạo:
  - `POST /api/posts` - Tạo bài viết
  - `GET /api/posts` - Lấy danh sách bài viết
  - `GET /api/posts/{id}` - Chi tiết bài viết
  - `POST /api/posts/{id}/like` - Thả tim
  - `DELETE /api/posts/{id}/like` - Bỏ tim
  - `POST /api/posts/{id}/comments` - Thêm bình luận
  - `GET /api/posts/{id}/comments` - Lấy bình luận
  - Bảng `community_groups` và API quản lý nhóm

---

## ⚠️ PHẦN 9: GAMIFICATION & THƯỞNG ĐIỂM (8%)

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-9.1.1** | Ghi nhận điểm thưởng khi báo cáo vi phạm, phân loại rác, tham gia chiến dịch | ⚠️ User model có `points` nhưng chưa có logic tự động cộng điểm | ⚠️ **THIẾU LOGIC** |
| **FR-9.1.2** | Hệ thống huy hiệu (Badges) | ❌ Database có bảng `badges`, `user_badges` nhưng Models và API đều thiếu | ⚠️ **THIẾU HOÀN TOÀN** |
| **FR-9.1.3** | Đổi điểm lấy quà tặng | ❌ Không có bảng `rewards`, `vouchers` | ❌ **THIẾU HOÀN TOÀN** |

**📝 Ghi chú:**
- Cần:
  - Auto-add points khi tạo report (trong `ReportService.createReport`)
  - `GET /api/badges` - Lấy danh sách badges
  - `GET /api/users/me/badges` - Badges của user
  - `POST /api/users/me/points/claim` - Nhận điểm
  - Bảng `rewards`, `user_rewards` và API đổi quà

---

## ❌ PHẦN 10: TÍCH HỢP BẢN ĐỒ MÔI TRƯỜNG (7%)

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-10.1.1** | Hiển thị bản đồ các điểm thu gom rác tái chế, bãi rác, trạm xử lý | ❌ Không có API | ❌ **THIẾU HOÀN TOÀN** |
| **FR-10.1.2** | Lọc bản đồ theo loại (rác điện tử, nhựa, pin, y tế...) | ❌ Không có API | ❌ **THIẾU HOÀN TOÀN** |
| **FR-10.1.3** | Hiển thị dữ liệu môi trường (AQI, tiếng ồn, nước) theo từng khu vực | ⚠️ Có `GET /api/aqi` nhưng chưa có dữ liệu tiếng ồn, nước | ⚠️ **THIẾU MỘT PHẦN** |

**📝 Ghi chú:**
- Cần tạo bảng `waste_collection_points` với các trường:
  - `name`, `type`, `latitude`, `longitude`, `address`
- Cần API:
  - `GET /api/map/collection-points?lat=...&lon=...&type=...` - Lấy điểm thu gom
  - `GET /api/map/environment-data?lat=...&lon=...` - Dữ liệu môi trường tổng hợp

---

## ❌ PHẦN 11: HỌC TẬP & NÂNG CAO NHẬN THỨC (5%)

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-11.1.1** | Thư viện kiến thức (bài viết, video, infographic) | ❌ Không có bảng `knowledge_articles` | ❌ **THIẾU HOÀN TOÀN** |
| **FR-11.1.2** | Mini quiz/trò chơi trắc nghiệm | ❌ Không có bảng `quizzes`, `quiz_questions` | ❌ **THIẾU HOÀN TOÀN** |
| **FR-11.1.3** | Gợi ý hành động nhỏ mỗi ngày | ❌ Không có API | ❌ **THIẾU HOÀN TOÀN** |

**📝 Ghi chú:**
- Cần tạo:
  - Bảng `knowledge_articles`, `quizzes`, `quiz_questions`, `user_quiz_scores`, `daily_tips`
  - API:
    - `GET /api/knowledge` - Lấy bài viết kiến thức
    - `GET /api/quizzes` - Lấy danh sách quiz
    - `POST /api/quizzes/{id}/submit` - Nộp bài quiz
    - `GET /api/daily-tips` - Lấy gợi ý hành động hôm nay

---

## ❌ PHẦN 12: PHÂN TÍCH DỮ LIỆU & BÁO CÁO (3%)

| FR ID | Yêu cầu | API hiện có | Trạng thái |
|-------|---------|-------------|------------|
| **FR-13.1.1** | Thống kê cá nhân (số lần phân loại rác, số báo cáo, điểm thưởng) | ❌ Không có API | ⚠️ **THIẾU** |
| **FR-13.1.2** | Dashboard cộng đồng (tổng số báo cáo, lượng rác tái chế) | ❌ Không có API | ❌ **THIẾU HOÀN TOÀN** |
| **FR-13.1.3** | Xuất báo cáo PDF | ❌ Không có API | ❌ **THIẾU HOÀN TOÀN** |

**📝 Ghi chú:**
- Cần tạo:
  - `GET /api/users/me/statistics` - Thống kê cá nhân
  - `GET /api/community/dashboard` - Dashboard cộng đồng
  - `GET /api/reports/export?format=pdf` - Xuất PDF (dùng iText hoặc Apache PDFBox)

---

## 📊 TỔNG KẾT

### ✅ ĐÃ HOÀN THÀNH (Có API đầy đủ):
1. ✅ **Đăng ký/Đăng nhập** (Email, Google, Facebook)
2. ✅ **Reset Password**
3. ✅ **Cập nhật Profile** (Avatar, thông tin cá nhân)
4. ✅ **AQI theo GPS** và theo vị trí đã lưu
5. ✅ **Check AQI Alert**
6. ✅ **Danh mục rác thải** (GET categories)
7. ✅ **Tạo báo cáo vi phạm** (mô tả + media + GPS + category)
8. ✅ **Cập nhật trạng thái báo cáo**
9. ✅ **Lưu vị trí** và lấy AQI cho vị trí đã lưu

### ⚠️ THIẾU MỘT PHẦN (Có một phần nhưng chưa đầy đủ):
1. ⚠️ **Lịch sử báo cáo** - Cần `GET /api/reports/me`
2. ⚠️ **Tùy chỉnh ngưỡng AQI** - Cần lưu vào DB
3. ⚠️ **Push Notification** - Chưa có service
4. ⚠️ **Địa điểm thu gom** - Chưa có bảng và API
5. ⚠️ **Tìm kiếm hướng dẫn rác** - Chưa có API search
6. ⚠️ **Gamification Logic** - Cần tự động cộng điểm

### ❌ THIẾU HOÀN TOÀN (Chưa có API):
1. ❌ **Chatbot AI** - Cần Controller + Service + AI Integration
2. ❌ **Community/Posts** - Cần hoàn thiện Models + Controller + Service
3. ❌ **Comments & Likes** - Cần Controller + Service
4. ❌ **Badges System** - Cần Controller + Service
5. ❌ **Rewards/Vouchers** - Cần bảng + API
6. ❌ **Notifications** - Cần bảng + Controller + Push Service
7. ❌ **Map Collection Points** - Cần bảng + API
8. ❌ **Knowledge Library** - Cần bảng + API
9. ❌ **Quizzes** - Cần bảng + API
10. ❌ **Statistics/Dashboard** - Cần API
11. ❌ **PDF Export** - Cần API
12. ❌ **Delete Account** - Cần API
13. ❌ **Community Groups** - Cần bảng + API

---

## 🎯 ĐỀ XUẤT ƯU TIÊN PHÁT TRIỂN

### 🟢 **Mức độ ưu tiên CAO** (Cần thiết cho MVP):
1. `GET /api/reports/me` - Lịch sử báo cáo
2. `DELETE /api/users/me` - Xóa tài khoản
3. Auto-add points khi tạo report
4. `POST /api/chatbot/message` + `GET /api/chatbot/history` - Chatbot cơ bản
5. Community Posts API (tạo, lấy, like, comment)
6. `GET /api/users/me/statistics` - Thống kê cá nhân

### 🟡 **Mức độ ưu tiên TRUNG BÌNH**:
1. Badges System (GET badges, GET user badges)
2. Notifications (bảng + API cơ bản)
3. Map Collection Points (bảng + API)
4. Search waste categories
5. Push Notification Service

### 🔴 **Mức độ ưu tiên THẤP** (Có thể làm sau):
1. Quizzes & Knowledge Library
2. Community Groups
3. Rewards/Vouchers
4. PDF Export
5. Daily Tips
6. AI Image Classification

---

## 📝 GHI CHÚ CUỐI

- Database schema đã có sẵn nhiều bảng (`posts`, `comments`, `likes`, `badges`, `chatbot_history`) nhưng Models và Controllers chưa được implement
- Cần ưu tiên hoàn thiện các Models hiện có trước khi tạo API mới
- Một số tính năng có thể được xử lý ở Frontend (như Guest Mode, Daily Tips) nhưng vẫn cần một số API hỗ trợ
- Push Notification cần tích hợp Firebase Cloud Messaging (Android) và APNs (iOS) hoặc Expo Push Notification Service

---

**Kết luận:** Backend hiện tại đã đáp ứng được khoảng **40-45%** các Functional Requirements. Cần bổ sung thêm nhiều API để hoàn thiện ứng dụng.

---

## 🎉 CẬP NHẬT - ĐÃ IMPLEMENT THÊM:

### ✅ **ĐÃ HOÀN THÀNH (Ưu tiên cao):**

1. ✅ **GET /api/reports/me** - Lấy lịch sử báo cáo của user hiện tại (FR-4.2.1)
   - Thêm `getUserReports()` trong `ReportService`
   - Thêm method `findByUserOrderByCreatedAtDesc()` trong `ReportRepository`

2. ✅ **DELETE /api/users/me** - Xóa tài khoản (FR-7.2)
   - Thêm `deleteUser()` trong `UserService`
   - Cascade delete tự động xóa dữ liệu liên quan

3. ✅ **Auto-add points** - Tự động cộng điểm khi tạo báo cáo (FR-9.1.1)
   - Mỗi báo cáo = 10 điểm
   - Tự động cập nhật trong `ReportService.createReport()`

4. ✅ **GET /api/users/me/statistics** - Thống kê cá nhân (FR-13.1.1)
   - Tổng số báo cáo, báo cáo theo trạng thái
   - Số vị trí đã lưu, số lần phân loại rác
   - Tổng số media đã upload, điểm thưởng hiện tại

5. ✅ **POST /api/chatbot/message** + **GET /api/chatbot/history** - Chatbot API (FR-5.1, FR-1.2.3)
   - Tạo `ChatbotHistory` model
   - Tạo `ChatbotService` với logic trả lời cơ bản
   - Tạo `ChatbotController` với 2 endpoints
   - Lưu lịch sử chat vào database

6. ✅ **Community Posts Models** - Đã tạo models cho Post, Comment, Like
   - Hoàn thiện `Post.java`, `Comment.java`, `Like.java`
   - Tạo `LikeId` cho composite primary key

### 📊 **Tỷ lệ hoàn thành mới: ~55-60%** (tăng từ 40-45%)

