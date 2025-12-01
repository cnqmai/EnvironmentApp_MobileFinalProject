-- Script xóa dữ liệu quiz hiện tại
-- Chạy script này để xóa tất cả điểm quiz của người dùng
-- Lệnh: psql -U env_app_user -d environment_db -f database/clear_quiz_data.sql

-- Hiển thị số bản ghi trước khi xóa
SELECT 'Số bản ghi quiz trước khi xóa: ' || COUNT(*) AS before_delete FROM user_quiz_scores;

-- Xóa tất cả điểm quiz của người dùng
DELETE FROM user_quiz_scores;

-- [TÙY CHỌN] Nếu muốn trừ điểm quiz đã cộng từ points của user:
-- Tính tổng điểm quiz đã cộng cho mỗi user và trừ đi
-- UPDATE users u
-- SET points = GREATEST(0, points - COALESCE((
--     SELECT SUM(score * 10) 
--     FROM user_quiz_scores uqs 
--     WHERE uqs.user_id = u.id
-- ), 0));

-- [TÙY CHỌN] Hoặc reset điểm của tất cả user về 0 (nếu muốn bắt đầu lại hoàn toàn)
-- UPDATE users SET points = 0;

-- Xác nhận số bản ghi đã xóa
SELECT 'Đã xóa tất cả bản ghi điểm quiz. Số bản ghi còn lại: ' || COUNT(*) AS after_delete 
FROM user_quiz_scores;

