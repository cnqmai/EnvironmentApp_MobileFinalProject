-- Xóa dữ liệu cũ để tránh trùng lặp
DELETE FROM user_rewards;
DELETE FROM user_quiz_scores;
DELETE FROM quiz_questions;
DELETE FROM quizzes;
DELETE FROM knowledge_articles;
DELETE FROM daily_tips;
DELETE FROM rewards;

-- 1. Dữ liệu Kiến thức & Video (Link VTV24 đã kiểm tra)
INSERT INTO knowledge_articles (id, title, content, type, thumbnail_url, video_url, author_name, category, view_count, is_published, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'Hướng dẫn phân loại rác tại nguồn đúng cách', 'Video hướng dẫn chi tiết từ VTV24 về cách phân loại rác thải sinh hoạt.', 'VIDEO', 'https://img.youtube.com/vi/fYRzg6nYLEc/hqdefault.jpg', 'https://www.youtube.com/watch?v=fYRzg6nYLEc', 'VTV24', 'PHAN_LOAI', 15430, true, NOW(), NOW()),
(gen_random_uuid(), '5 Cách tái chế chai nhựa thành vật dụng hữu ích', 'Biến chai nhựa cũ thành chậu cây, hộp bút độc đáo.', 'VIDEO', 'https://img.youtube.com/vi/FOcCorkFkS4/hqdefault.jpg', 'https://www.youtube.com/watch?v=FOcCorkFkS4', 'Mẹo Vặt', 'TAI_CHE', 8100, true, NOW(), NOW()),
(gen_random_uuid(), 'Báo động: Mỗi gia đình Việt xả ra 1kg túi nilon/tháng', 'Thực trạng sử dụng túi nilon tràn lan và tác hại khủng khiếp.', 'VIDEO', 'https://img.youtube.com/vi/Fiely2m_4pk/hqdefault.jpg', 'https://www.youtube.com/watch?v=Fiely2m_4pk', 'VTV24', 'GIAM_RAC', 4500, true, NOW(), NOW()),
(gen_random_uuid(), 'Hiểm họa khôn lường từ rác thải điện tử và pin', 'Cảnh báo về nguy cơ độc hại khi xử lý sai cách pin và rác điện tử.', 'VIDEO', 'https://img.youtube.com/vi/6RGo590Fm6c/hqdefault.jpg', 'https://www.youtube.com/watch?v=6RGo590Fm6c', 'VTV24', 'PHAN_LOAI', 2100, true, NOW(), NOW()),
(gen_random_uuid(), 'Lợi ích tuyệt vời của việc đi xe đạp', 'Đi xe đạp giúp rèn luyện sức khỏe và giảm khí thải carbon.', 'ARTICLE', 'https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b43?auto=format&fit=crop&w=800&q=80', NULL, 'Sống Khỏe', 'GIAM_RAC', 5600, true, NOW(), NOW());

-- 2. Dữ liệu Quà tặng (Rewards)
INSERT INTO rewards (id, name, description, points_cost, image_url, type, quantity_available, is_active, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'Voucher GotIt 50.000đ', 'Áp dụng tại hơn 100 thương hiệu.', 500, 'https://img.freepik.com/premium-vector/coupon-vector-voucher-gift-card-design-template-promo-code-ticket_106206-1929.jpg', 'VOUCHER', 100, true, NOW(), NOW()),
(gen_random_uuid(), 'Túi vải Canvas Môi trường', 'Túi tote vải canvas thời trang, bền đẹp.', 300, 'https://img.freepik.com/premium-vector/eco-bag-cloth-bag-vector-illustration-isolated-white-background_106368-232.jpg', 'MERCHANDISE', 50, true, NOW(), NOW()),
(gen_random_uuid(), 'Bộ ống hút tre tự nhiên', 'Gồm 02 ống hút tre và cọ rửa.', 200, 'https://m.media-amazon.com/images/I/71w-7wK5cWL.jpg', 'MERCHANDISE', 200, true, NOW(), NOW()),
(gen_random_uuid(), 'Quyên góp trồng 1 Cây xanh', 'Đóng góp trồng cây tại rừng phòng hộ.', 1000, 'https://img.freepik.com/premium-vector/planting-tree-vector-illustration_106368-233.jpg', 'TREE', -1, true, NOW(), NOW()),
(gen_random_uuid(), 'Bình giữ nhiệt Vỏ Tre', 'Lõi inox 304, vỏ tre ép sang trọng.', 1500, 'https://m.media-amazon.com/images/I/61+y+K+k+L._AC_SL1500_.jpg', 'MERCHANDISE', 20, true, NOW(), NOW());

-- 3. Dữ liệu Daily Tips (Đã fix ID thành UUID)
INSERT INTO daily_tips (id, title, description, category, points_reward, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Mang bình nước cá nhân', 'Sử dụng bình nước tái sử dụng thay vì chai nhựa dùng một lần.', 'Sống xanh', 10, NOW(), NOW()),
(gen_random_uuid(), 'Tắt thiết bị điện', 'Rút phích cắm khi không sử dụng để tiết kiệm điện.', 'Tiết kiệm điện', 10, NOW(), NOW()),
(gen_random_uuid(), 'Phân loại rác tại nguồn', 'Tách rác hữu cơ và vô cơ giúp quy trình xử lý hiệu quả hơn.', 'Phân loại rác', 15, NOW(), NOW());

-- 4. Dữ liệu Quiz
DO $$
DECLARE
    quiz_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO quizzes (id, title, description, difficulty, time_limit_minutes, is_active, created_at, updated_at)
    VALUES (quiz_id, 'Hiểu biết về Tái chế rác thải', 'Kiểm tra kiến thức của bạn về quy trình tái chế.', 'EASY', 5, true, NOW(), NOW());

    INSERT INTO quiz_questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at)
    VALUES
    (gen_random_uuid(), quiz_id, 'Loại rác nào sau đây CÓ THỂ tái chế?', 'Túi nilon bẩn', 'Vỏ hộp sữa giấy', 'Khăn giấy đã qua sử dụng', 'Mảnh sành sứ vỡ', 'B', 1, NOW()),
    (gen_random_uuid(), quiz_id, 'Pin cũ nên được xử lý như thế nào?', 'Vứt thùng rác thường', 'Đốt cháy', 'Chôn xuống đất', 'Mang đến điểm thu gom nguy hại', 'D', 2, NOW()),
    (gen_random_uuid(), quiz_id, 'Mã số 1 trên chai nhựa là gì?', 'PET', 'HDPE', 'PVC', 'LDPE', 'A', 3, NOW()),
    (gen_random_uuid(), quiz_id, 'Xử lý rác hữu cơ tốt nhất?', 'Vứt sông', 'Ủ phân (Compost)', 'Đốt', 'Gói nilon', 'B', 4, NOW()),
    (gen_random_uuid(), quiz_id, 'Thời gian chai nhựa phân hủy?', '10 năm', '50 năm', '100 năm', '450 - 1000 năm', 'D', 5, NOW());
END $$;