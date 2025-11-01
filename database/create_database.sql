-- Script tạo database và user cho ứng dụng Environment App
-- Chạy script này với quyền superuser (postgres)
-- Lệnh: psql -U postgres -f create_database.sql

-- Tạo user nếu chưa tồn tại (phải làm trước khi tạo database)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'env_app_user') THEN
        CREATE ROLE env_app_user WITH LOGIN PASSWORD '2112';
    END IF;
END
$$;

-- Tạo database (PostgreSQL không hỗ trợ IF NOT EXISTS, nên sẽ báo lỗi nếu đã tồn tại - bỏ qua lỗi)
-- Nếu database đã tồn tại, bạn có thể bỏ qua bước này
