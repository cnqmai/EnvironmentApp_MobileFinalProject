-- Kích hoạt extension để sử dụng UUID làm khóa chính
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --- Bảng Người dùng (FR-1.x) ---
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    default_location VARCHAR(255), -- FR-1.2.1
    points INT DEFAULT 0, -- FR-9.1.1
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS 'Lưu trữ thông tin người dùng (FR-1.x)';

-- --- Bảng Báo cáo vi phạm (FR-4.x) ---
CREATE TYPE report_status AS ENUM ('received', 'processing', 'completed');

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL, -- FR-4.1.1
    latitude DECIMAL(9, 6) NOT NULL, -- FR-4.1.2
    longitude DECIMAL(9, 6) NOT NULL, -- FR-4.1.2
    status report_status NOT NULL DEFAULT 'received', -- FR-4.2.2
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE reports IS 'Lưu trữ các báo cáo vi phạm môi trường (FR-4.x)';

-- --- Bảng lưu media (ảnh/video) cho các báo cáo (FR-4.1.1) ---
CREATE TYPE media_type AS ENUM ('image', 'video');

CREATE TABLE report_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    type media_type NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE report_media IS 'Lưu trữ ảnh/video cho các báo cáo vi phạm (FR-4.1.1)';

-- --- Bảng Bài viết cộng đồng (FR-8.x) ---
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- FR-8.1.1
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

-- --- Tạo chỉ mục (Indexes) để tăng tốc độ truy vấn ---
CREATE INDEX ON reports (user_id);
CREATE INDEX ON report_media (report_id);
CREATE INDEX ON posts (user_id);
CREATE INDEX ON comments (post_id);
CREATE INDEX ON comments (user_id);
CREATE INDEX ON likes (post_id);
CREATE INDEX ON chatbot_history (user_id);