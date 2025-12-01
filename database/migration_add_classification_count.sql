-- Migration: Thêm cột classification_count vào bảng users
-- Chạy script này nếu database đã tồn tại và có dữ liệu
-- Lệnh: psql -U env_app_user -d environment_db -f migration_add_classification_count.sql

-- Kiểm tra và thêm cột classification_count nếu chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'classification_count'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN classification_count INT DEFAULT 0;
        
        RAISE NOTICE 'Đã thêm cột classification_count vào bảng users';
    ELSE
        RAISE NOTICE 'Cột classification_count đã tồn tại';
    END IF;
END
$$;

