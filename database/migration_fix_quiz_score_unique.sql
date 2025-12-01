-- Migration: Thêm unique constraint cho user_quiz_scores để đảm bảo mỗi user chỉ có 1 score cho mỗi quiz
-- Chạy script này nếu database đã tồn tại
-- Lệnh: psql -U env_app_user -d environment_db -f migration_fix_quiz_score_unique.sql

-- Kiểm tra và thêm unique constraint nếu chưa có
DO $$
BEGIN
    -- Kiểm tra xem constraint đã tồn tại chưa
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'user_quiz_scores_user_id_quiz_id_key'
        AND conrelid = 'user_quiz_scores'::regclass
    ) THEN
        -- Xóa các bản ghi trùng lặp trước (giữ lại bản ghi mới nhất)
        DELETE FROM user_quiz_scores a
        USING user_quiz_scores b
        WHERE a.user_id = b.user_id 
        AND a.quiz_id = b.quiz_id
        AND a.completed_at < b.completed_at;
        
        -- Thêm unique constraint
        ALTER TABLE user_quiz_scores 
        ADD CONSTRAINT user_quiz_scores_user_id_quiz_id_key UNIQUE (user_id, quiz_id);
        
        RAISE NOTICE 'Đã thêm unique constraint cho user_quiz_scores';
    ELSE
        RAISE NOTICE 'Unique constraint đã tồn tại';
    END IF;
END
$$;

