-- --- THÊM MỚI: Xóa các bảng cũ nếu chúng tồn tại để tạo lại ---
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
DROP TYPE IF EXISTS collection_point_type;
DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS notification_status;
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

-- --- Bảng Thông báo (FR-6.x) ---
CREATE TYPE notification_type AS ENUM ('campaign', 'collection_reminder', 'weather_alert', 'aqi_alert', 'badge_earned', 'report_status', 'general');
CREATE TYPE notification_status AS ENUM ('unread', 'read');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    status notification_status NOT NULL DEFAULT 'unread',
    related_id VARCHAR(255), -- ID liên quan (badge_id, report_id, campaign_id, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notifications IS 'Lưu trữ thông báo cho người dùng (FR-6.x)';

-- --- Bảng Cấu hình Thông báo của User (FR-2.2.2, FR-6.x) ---
CREATE TABLE notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    aqi_alert_enabled BOOLEAN DEFAULT true,
    aqi_threshold INT DEFAULT 100, -- Ngưỡng AQI để gửi cảnh báo
    collection_reminder_enabled BOOLEAN DEFAULT true,
    campaign_notifications_enabled BOOLEAN DEFAULT true,
    weather_alert_enabled BOOLEAN DEFAULT true,
    badge_notifications_enabled BOOLEAN DEFAULT true,
    report_status_notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notification_settings IS 'Cấu hình thông báo của từng user (FR-2.2.2, FR-6.x)';

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
CREATE INDEX ON notifications (user_id);
CREATE INDEX ON notifications (status);
CREATE INDEX ON notifications (created_at);
CREATE INDEX ON waste_collection_points (type);
CREATE INDEX ON waste_collection_points (latitude, longitude);
CREATE INDEX ON knowledge_articles (category);
CREATE INDEX ON knowledge_articles (is_published);
CREATE INDEX ON quiz_questions (quiz_id);
CREATE INDEX ON user_quiz_scores (user_id);
CREATE INDEX ON user_quiz_scores (quiz_id);
CREATE INDEX ON community_groups (area_type, area_name);
CREATE INDEX ON group_members (group_id);
CREATE INDEX ON rewards (type);
CREATE INDEX ON rewards (is_active);
CREATE INDEX ON user_rewards (user_id);
CREATE INDEX ON user_rewards (status);
CREATE INDEX ON daily_tips (display_date);
CREATE INDEX ON daily_tips (is_active);

-- --- Bảng Bài viết Kiến thức (FR-11.1.1) ---
CREATE TYPE article_type AS ENUM ('article', 'video', 'infographic');

CREATE TABLE knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type article_type NOT NULL DEFAULT 'article',
    thumbnail_url TEXT,
    video_url TEXT,
    author_name VARCHAR(100),
    category VARCHAR(100),
    view_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE knowledge_articles IS 'Thư viện kiến thức về môi trường (FR-11.1.1)';

-- --- Bảng Quiz (FR-11.1.2) ---
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
COMMENT ON TABLE quizzes IS 'Các bài quiz/trắc nghiệm về môi trường (FR-11.1.2)';

-- --- Bảng Câu hỏi Quiz ---
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
COMMENT ON TABLE quiz_questions IS 'Câu hỏi trong các quiz (FR-11.1.2)';

-- --- Bảng Kết quả Quiz của User ---
CREATE TABLE user_quiz_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INT NOT NULL, -- Số câu đúng
    total_questions INT NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    time_taken_seconds INT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, quiz_id) -- Mỗi user chỉ làm quiz một lần (hoặc có thể bỏ UNIQUE để cho phép làm lại)
);
COMMENT ON TABLE user_quiz_scores IS 'Kết quả quiz của người dùng (FR-11.1.2)';

-- --- Bảng Nhóm Cộng đồng (FR-8.1.3) ---
CREATE TABLE community_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    area_type VARCHAR(50), -- 'ward' (phường/xã), 'district' (quận/huyện), 'city' (thành phố)
    area_name VARCHAR(255),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    member_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE community_groups IS 'Nhóm cộng đồng theo khu vực (FR-8.1.3)';

-- --- Bảng Thành viên Nhóm ---
CREATE TABLE group_members (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, group_id)
);
COMMENT ON TABLE group_members IS 'Thành viên của các nhóm cộng đồng';

-- --- Bảng Phần thưởng/Voucher (FR-9.1.3) ---
CREATE TYPE reward_type AS ENUM ('voucher', 'tree', 'merchandise', 'points_bonus');

CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type reward_type NOT NULL,
    points_cost INT NOT NULL,
    image_url TEXT,
    voucher_code VARCHAR(100), -- Nếu là voucher
    discount_percent INT, -- Nếu là voucher có % giảm giá
    quantity_available INT DEFAULT -1, -- -1 = không giới hạn
    is_active BOOLEAN DEFAULT true,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE rewards IS 'Danh mục phần thưởng/voucher có thể đổi bằng điểm (FR-9.1.3)';

-- --- Bảng Phần thưởng của User ---
CREATE TABLE user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    voucher_code VARCHAR(100), -- Code để user sử dụng
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'claimed', 'used', 'expired'
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);
COMMENT ON TABLE user_rewards IS 'Phần thưởng mà user đã đổi (FR-9.1.3)';

-- --- Bảng Gợi ý Hành động Mỗi ngày (FR-11.1.3) ---
CREATE TABLE daily_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50), -- 'energy', 'waste', 'water', 'transport', 'general'
    icon_url TEXT,
    action_text VARCHAR(255), -- Ví dụ: "Tắt điện khi ra ngoài"
    points_reward INT DEFAULT 5, -- Điểm thưởng khi hoàn thành
    is_active BOOLEAN DEFAULT true,
    display_date DATE, -- Ngày hiển thị tip này
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE daily_tips IS 'Gợi ý hành động nhỏ mỗi ngày (FR-11.1.3)';

-- --- Bảng Điểm Thu Gom Rác (FR-10.1.1, FR-10.1.2) ---
CREATE TYPE collection_point_type AS ENUM ('plastic', 'electronic', 'organic', 'metal', 'glass', 'paper', 'hazardous', 'medical', 'other');

CREATE TABLE waste_collection_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type collection_point_type NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    address TEXT,
    description TEXT,
    phone_number VARCHAR(20),
    opening_hours VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE waste_collection_points IS 'Lưu trữ các điểm thu gom rác tái chế (FR-10.1.1)';

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

-- Cập nhật trường collection_point_type, disposal_guideline, và recycling_guideline cho 10 loại rác
-- -- 1. Rác thải nhựa (PLASTIC)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'PLASTIC',
--     disposal_guideline = 'Làm sạch chai/hộp nhựa, tháo nhãn mác (nếu có). Gom riêng và giao cho các điểm thu gom tái chế.',
--     recycling_guideline = 'Tái chế được 99% (PET, HDPE, PVC...). Có thể chuyển thành hạt nhựa, sợi tổng hợp hoặc vật liệu xây dựng.',
--     updated_at = NOW()
-- WHERE id = 1;

-- -- 2. Rác thải điện tử (ELECTRONIC)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'ELECTRONIC',
--     disposal_guideline = 'Tuyệt đối không được vứt vào thùng rác sinh hoạt. Thu gom và mang đến các điểm tiếp nhận chính thức (UBND Phường, MM Mega Market...) để xử lý đúng quy trình.',
--     recycling_guideline = 'Các linh kiện chứa kim loại quý (vàng, bạc, đồng) và vật liệu có thể tái sử dụng. Cần được tháo dỡ bởi các đơn vị chuyên môn để tránh rò rỉ chất độc.',
--     updated_at = NOW()
-- WHERE id = 2;

-- -- 3. Rác thải hữu cơ (ORGANIC)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'ORGANIC',
--     disposal_guideline = 'Tách riêng khỏi các loại rác khác. Có thể dùng làm phân bón tại nhà hoặc chuyển đến các điểm thu gom hữu cơ chuyên biệt.',
--     recycling_guideline = 'Tái chế bằng phương pháp ủ phân (composting) để tạo ra phân bón hữu cơ chất lượng cao cho cây trồng.',
--     updated_at = NOW()
-- WHERE id = 3;

-- -- 4. Rác thải kim loại (METAL)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'METAL',
--     disposal_guideline = 'Làm sạch, loại bỏ dầu mỡ (nếu có). Ép dẹt lon, hộp để tiết kiệm không gian. Thu gom riêng để giao cho cơ sở phế liệu.',
--     recycling_guideline = 'Tái chế 100% không giới hạn số lần. Kim loại được nung chảy và đúc thành sản phẩm mới, giúp tiết kiệm năng lượng đáng kể.',
--     updated_at = NOW()
-- WHERE id = 4;

-- -- 5. Rác thải thủy tinh (GLASS)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'GLASS',
--     disposal_guideline = 'Rửa sạch, loại bỏ nắp nhựa/kim loại. Nếu vỡ, bọc kỹ bằng giấy báo hoặc vải dày và dán nhãn "THỦY TINH VỠ" để đảm bảo an toàn cho người thu gom.',
--     recycling_guideline = 'Tái chế bằng cách nghiền nát và nấu chảy để tạo ra chai lọ, gạch lát hoặc sợi thủy tinh mới. Nên phân loại theo màu sắc (trong suốt, xanh, nâu).',
--     updated_at = NOW()
-- WHERE id = 5;

-- -- 6. Rác thải giấy (PAPER)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'PAPER',
--     disposal_guideline = 'Thu gom giấy, bìa cứng khô ráo, không dính dầu mỡ/thức ăn. Ép phẳng hộp carton. Không bao gồm giấy vệ sinh, giấy ăn đã qua sử dụng.',
--     recycling_guideline = 'Tái chế bằng cách nghiền thành bột giấy và ép thành giấy, hộp carton, hoặc vật liệu cách nhiệt mới. Giấy có thể tái chế nhiều lần.',
--     updated_at = NOW()
-- WHERE id = 6;

-- -- 7. Rác thải nguy hại (HAZARDOUS)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'HAZARDOUS',
--     disposal_guideline = 'Không bao giờ vứt vào thùng rác thông thường. Đóng gói kín và mang đến các điểm thu gom rác nguy hại (Trạm TT Quận, Môi trường Đô thị) để xử lý chuyên biệt.',
--     recycling_guideline = 'Ít khả năng tái chế trực tiếp. Chủ yếu là xử lý an toàn (đốt, chôn lấp) để trung hòa hóa chất và ngăn chất độc hại ngấm vào môi trường.',
--     updated_at = NOW()
-- WHERE id = 7;

-- -- 8. Rác thải xây dựng (CONSTRUCTION)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'CONSTRUCTION',
--     disposal_guideline = 'Cần liên hệ với các đơn vị dịch vụ thu gom rác xây dựng chuyên nghiệp. Không được đổ ở nơi công cộng hoặc trộn lẫn với rác sinh hoạt.',
--     recycling_guideline = 'Có thể tái chế thành cốt liệu xây dựng (sỏi, cát nhân tạo) để dùng làm nền đường, vật liệu san lấp.',
--     updated_at = NOW()
-- WHERE id = 8;

-- -- 9. Rác thải y tế (MEDICAL)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'MEDICAL',
--     disposal_guideline = 'Đóng gói kim tiêm, băng gạc, thuốc hết hạn vào hộp/túi riêng biệt (có dán nhãn). Giao cho các bệnh viện hoặc đơn vị xử lý rác y tế chuyên biệt.',
--     recycling_guideline = 'Các vật liệu sắc nhọn, lây nhiễm phải được xử lý bằng phương pháp tiệt trùng hoặc đốt ở nhiệt độ cao. Ít vật liệu được tái chế trực tiếp để đảm bảo an toàn.',
--     updated_at = NOW()
-- WHERE id = 9;

-- -- 10. Rác thải khác (OTHER)
-- UPDATE waste_categories
-- SET
--     collection_point_type = 'OTHER',
--     disposal_guideline = 'Rác thải không thể tái chế hoặc không thuộc các danh mục trên (như vải vụn, đồ sứ, tã lót). Vứt vào thùng rác sinh hoạt thông thường.',
--     recycling_guideline = 'Khả năng tái chế thấp. Đồ cũ còn dùng được có thể tặng hoặc bán. Phần còn lại được đưa đến bãi chôn lấp hoặc nhà máy đốt rác.',
--     updated_at = NOW()
-- WHERE id = 10;