-- --- Xóa các bảng cũ để tạo lại sạch sẽ ---
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
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
DROP TABLE IF EXISTS user_quiz_scores CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS knowledge_articles CASCADE;
DROP TABLE IF EXISTS daily_tips CASCADE;
DROP TABLE IF EXISTS user_rewards CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS community_groups CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS waste_collection_points CASCADE;
DROP TABLE IF EXISTS user_daily_tip_completions CASCADE; -- ĐÃ THÊM DROP TABLE

-- Xóa các ENUM cũ
DROP TYPE IF EXISTS collection_point_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_status CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS media_type CASCADE;
DROP TYPE IF EXISTS article_type CASCADE;
DROP TYPE IF EXISTS reward_type CASCADE;

-- Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --- 1. Bảng Người dùng ---
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
    share_personal_data BOOLEAN DEFAULT true,
    share_location BOOLEAN DEFAULT true,
    unread_notification_count INT DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- 2. Bảng Danh mục Rác ---
CREATE TABLE waste_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    collection_point_type VARCHAR(50),
    disposal_guideline TEXT,
    recycling_guideline TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- 3. Bảng Báo cáo ---
CREATE TYPE report_status AS ENUM ('RECEIVED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES waste_categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    status report_status NOT NULL DEFAULT 'RECEIVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- 4. Bảng Media Báo cáo ---
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TABLE report_media (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL, -- 'image' hoặc 'video'
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- 5. Bảng Kiến thức (Knowledge) ---
CREATE TYPE article_type AS ENUM ('ARTICLE', 'VIDEO', 'INFOGRAPHIC');
CREATE TABLE knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type article_type NOT NULL DEFAULT 'ARTICLE',
    thumbnail_url TEXT,
    video_url TEXT,
    author_name VARCHAR(100),
    category VARCHAR(100),
    view_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- 6. Bảng Quiz ---
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',
    time_limit_minutes INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_answer VARCHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
    explanation TEXT,
    order_number INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_quiz_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    time_taken_seconds INT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- Bỏ UNIQUE để cho phép làm lại nhiều lần
);

-- --- 7. Bảng Phần thưởng (Rewards) ---
CREATE TYPE reward_type AS ENUM ('VOUCHER', 'TREE', 'MERCHANDISE', 'POINTS_BONUS');
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type reward_type NOT NULL,
    points_cost INT NOT NULL,
    image_url TEXT,
    voucher_code VARCHAR(100),
    discount_percent INT,
    quantity_available INT DEFAULT -1,
    is_active BOOLEAN DEFAULT true,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    voucher_code VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- --- 8. Bảng Daily Tips ---
CREATE TABLE daily_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    icon_url TEXT,
    action_text VARCHAR(255),
    points_reward INT DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    display_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- Bảng theo dõi hoàn thành Daily Tip của Người dùng (SỬA LỖI: ĐÃ BỎ UNIQUE) ---
CREATE TABLE user_daily_tip_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_tip_id UUID NOT NULL REFERENCES daily_tips(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- 9. Bảng Chatbot History ---
CREATE TABLE chatbot_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_query TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- 10. Bảng Badges ---
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    required_points INT NOT NULL,
    criteria TEXT
);

CREATE TABLE user_badges (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- --- 11. Bảng Saved Locations ---
CREATE TABLE saved_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- 12. Bảng Notification Settings ---
CREATE TABLE notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    aqi_alert_enabled BOOLEAN DEFAULT true,
    aqi_threshold INT DEFAULT 100,
    collection_reminder_enabled BOOLEAN DEFAULT true,
    campaign_notifications_enabled BOOLEAN DEFAULT true,
    weather_alert_enabled BOOLEAN DEFAULT true,
    badge_notifications_enabled BOOLEAN DEFAULT true,
    report_status_notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- 13. Bảng Cộng đồng (Group/Post/Comment/Like) ---
CREATE TABLE community_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    area_type VARCHAR(50),
    area_name VARCHAR(255),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    member_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE group_members (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, group_id)
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- --- DATA MẪU: Danh mục Rác ---
INSERT INTO waste_categories (name, description, icon_url) VALUES
('Rác thải nhựa', 'Chai, túi, bao bì nhựa', NULL),
('Rác thải điện tử', 'Điện thoại, pin, linh kiện điện tử', NULL),
('Rác thải hữu cơ', 'Thức ăn thừa, vỏ rau củ', NULL),
('Rác thải kim loại', 'Lon, sắt, nhôm', NULL),
('Rác thải thủy tinh', 'Chai lọ, bình thủy tinh', NULL),
('Rác thải giấy', 'Giấy vụn, bìa carton', NULL),
('Rác thải nguy hại', 'Hóa chất, dầu nhớt', NULL),
('Rác thải y tế', 'Bông băng, kim tiêm', NULL),
('Rác thải khác', 'Vải vụn, gốm sứ vỡ', NULL);

-- --- DATA MẪU: Huy hiệu ---
INSERT INTO badges (name, description, icon_url, required_points, criteria) VALUES
('Người Xanh', 'Huy hiệu dành cho người mới bắt đầu hành trình xanh.', NULL, 100, 'Đạt 100 điểm'),
('Chiến binh Môi trường', 'Dành cho những người tích cực bảo vệ môi trường.', NULL, 500, 'Đạt 500 điểm'),
('Thành phố Sạch', 'Danh hiệu cao quý nhất cho người đóng góp lớn.', NULL, 1000, 'Đạt 1000 điểm');