-- Script tạo database và user cho ứng dụng Environment App
-- Chạy script này với quyền superuser (postgres)
-- Lệnh: psql -U postgres -f create_database.sql

-- 1. Tạo user nếu chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'env_app_user') THEN
        CREATE ROLE env_app_user WITH LOGIN PASSWORD '2112';
    END IF;
END
$$;

-- 2. Tạo database (Nếu chưa có)
-- Lưu ý: Nếu đang chạy trong tool SQL editor thì bỏ qua dòng này và tự tạo DB thủ công
-- CREATE DATABASE environment_db OWNER env_app_user;