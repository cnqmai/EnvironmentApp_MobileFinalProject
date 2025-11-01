-- --- THÊM MỚI: Xóa các bảng cũ nếu chúng tồn tại để tạo lại ---
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS chatbot_history CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS report_media CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS waste_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS saved_locations CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TYPE IF EXISTS report_status;
DROP TYPE IF EXISTS media_type;
-- ---------------------------------------------------------

-- Kích hoạt extension để sử dụng UUID làm khóa chính
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --- Bảng Người dùng (FR-1.x) ---
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    default_location VARCHAR(255),
    points INT DEFAULT 0,
    gender VARCHAR(10),
    date_of_birth DATE,
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS 'Lưu trữ thông tin người dùng (FR-1.x)';

-- --- Bảng Danh mục Rác (Waste Categories) ---
CREATE TABLE waste_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE waste_categories IS 'Lưu trữ các danh mục rác thải (ví dụ: Rác thải nhựa, Rác thải điện tử, ...)';

-- --- Bảng Báo cáo vi phạm (FR-4.x) ---
CREATE TYPE report_status AS ENUM ('received', 'processing', 'completed');

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES waste_categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    status report_status NOT NULL DEFAULT 'received',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE reports IS 'Lưu trữ các báo cáo vi phạm môi trường (FR-4.x)';

-- --- Bảng lưu media (ảnh/video) cho các báo cáo (FR-4.1.1) ---
CREATE TYPE media_type AS ENUM ('image', 'video');

CREATE TABLE report_media (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    type media_type NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE report_media IS 'Lưu trữ ảnh/video cho các báo cáo vi phạm (FR-4.1.1)';

-- --- Bảng Bài viết cộng đồng (FR-8.x) ---
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE posts IS 'Lưu trữ các bài viết, mẹo sống xanh do người dùng chia sẻ (FR-8.1.1)';

-- --- Bảng Bình luận (FR-8.1.2) ---
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE comments IS 'Lưu trữ bình luận cho các bài viết (FR-8.1.2)';

-- --- Bảng Lượt thích (FR-8.1.2) ---
CREATE TABLE likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);
COMMENT ON TABLE likes IS 'Lưu trữ lượt thả tim cho các bài viết (FR-8.1.2)';

-- --- Bảng Lịch sử Chatbot (FR-1.2.3, FR-5.x) ---
CREATE TABLE chatbot_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_query TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE chatbot_history IS 'Lưu lịch sử câu hỏi đã gửi chatbot (FR-1.2.3)';

-- --- Bảng Huy hiệu (FR-9.1.2) ---
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    required_points INT NOT NULL
);
COMMENT ON TABLE badges IS 'Định nghĩa các huy hiệu có thể đạt được (FR-9.1.2)';

-- --- Bảng Huy hiệu của Người dùng ---
CREATE TABLE user_badges (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);
COMMENT ON TABLE user_badges IS 'Ghi nhận các huy hiệu mà người dùng đã đạt được';

-- --- Bảng Vị trí đã Lưu (Saved Locations) ---
CREATE TABLE saved_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE saved_locations IS 'Lưu trữ các vị trí đã lưu của người dùng (ví dụ: "Nhà", "Công ty")';

-- --- Bảng Token Reset Mật khẩu ---
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE password_reset_tokens IS 'Lưu trữ token reset mật khẩu';

-- --- Tạo chỉ mục (Indexes) để tăng tốc độ truy vấn ---
CREATE INDEX ON reports (user_id);
CREATE INDEX ON reports (category_id);
CREATE INDEX ON report_media (report_id);
CREATE INDEX ON posts (user_id);
CREATE INDEX ON comments (post_id);
CREATE INDEX ON comments (user_id);
CREATE INDEX ON likes (post_id);
CREATE INDEX ON chatbot_history (user_id);
CREATE INDEX ON saved_locations (user_id);
CREATE INDEX ON password_reset_tokens (user_id);
CREATE INDEX ON password_reset_tokens (token);

-- --- Dữ liệu mẫu cho Danh mục Rác ---
INSERT INTO waste_categories (name, description, icon_url) VALUES
('Rác thải nhựa', 'Các loại rác thải làm từ nhựa như chai, túi, bao bì nhựa', NULL),
('Rác thải điện tử', 'Các thiết bị điện tử hư hỏng như điện thoại, laptop, pin', NULL),
('Rác thải hữu cơ', 'Rác thải có thể phân hủy như thức ăn thừa, lá cây', NULL),
('Rác thải kim loại', 'Các vật dụng kim loại như lon, sắt, nhôm', NULL),
('Rác thải thủy tinh', 'Chai lọ, bình làm từ thủy tinh', NULL),
('Rác thải giấy', 'Giấy, bìa carton, sách báo cũ', NULL),
('Rác thải nguy hại', 'Rác thải độc hại như hóa chất, pin, dầu nhớt', NULL),
('Rác thải xây dựng', 'Vật liệu xây dựng thải bỏ như gạch, xi măng', NULL),
('Rác thải y tế', 'Rác thải từ bệnh viện, phòng khám', NULL),
('Rác thải khác', 'Các loại rác thải không thuộc các danh mục trên', NULL);