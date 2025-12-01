-- 1. Tạo biến để lưu ID của Quiz mới (UUID)
DO $$
DECLARE
    new_quiz_id UUID := gen_random_uuid();
BEGIN

    -- 2. Thêm bài Quiz mới
    INSERT INTO quizzes (id, title, description, difficulty, time_limit_minutes, is_active, created_at, updated_at)
    VALUES (
        new_quiz_id, 
        'Hiểu biết về Tái chế rác thải', 
        'Kiểm tra kiến thức của bạn về quy trình tái chế và các loại rác có thể tái chế.', 
        'EASY', 
        5, 
        true, 
        NOW(), 
        NOW()
    );

    -- 3. Thêm các câu hỏi cho Quiz này
    INSERT INTO quiz_questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at)
    VALUES
    -- Câu 1
    (gen_random_uuid(), new_quiz_id, 'Loại rác nào sau đây CÓ THỂ tái chế?', 'Túi nilon bẩn', 'Vỏ hộp sữa giấy', 'Khăn giấy đã qua sử dụng', 'Mảnh sành sứ vỡ', 'B', 1, NOW()),
    
    -- Câu 2
    (gen_random_uuid(), new_quiz_id, 'Pin cũ nên được xử lý như thế nào?', 'Vứt vào thùng rác thường', 'Đốt cháy', 'Chôn xuống đất', 'Mang đến điểm thu gom rác nguy hại', 'D', 2, NOW()),
    
    -- Câu 3
    (gen_random_uuid(), new_quiz_id, 'Mã số 1 trong tam giác tái chế trên chai nhựa biểu thị loại nhựa nào?', 'PET (Polyethylene Terephthalate)', 'HDPE (High-Density Polyethylene)', 'PVC (Polyvinyl Chloride)', 'LDPE (Low-Density Polyethylene)', 'A', 3, NOW()),

    -- Câu 4
    (gen_random_uuid(), new_quiz_id, 'Rác thải hữu cơ (thức ăn thừa, vỏ rau củ) nên được xử lý thế nào là tốt nhất?', 'Vứt ra sông hồ', 'Ủ làm phân bón (Compost)', 'Đốt cùng rác nhựa', 'Gói chặt trong nhiều lớp túi nilon', 'B', 4, NOW()),

    -- Câu 5
    (gen_random_uuid(), new_quiz_id, 'Thời gian để một chai nhựa phân hủy tự nhiên là bao lâu?', '10 năm', '50 năm', '100 năm', '450 - 1000 năm', 'D', 5, NOW());

END $$;