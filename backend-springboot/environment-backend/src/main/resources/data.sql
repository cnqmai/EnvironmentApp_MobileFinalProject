-- 1. Rác hữu cơ (Hỗ trợ cả tên Tiếng Việt và Tiếng Anh để test)
INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'organic', 
    'Organic waste (Rác hữu cơ): Thức ăn thừa, vỏ rau củ, bã cà phê...',
    'Nên ủ làm phân bón (Compost) hoặc bỏ vào túi phân hủy sinh học.',
    'Tái chế thành phân bón hữu cơ.',
    'ORGANIC',
    'https://cdn-icons-png.flaticon.com/512/3299/3299908.png'
) ON CONFLICT (name) DO NOTHING;

INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'Rác hữu cơ', 
    'Bao gồm thức ăn thừa, vỏ rau củ quả, bã cà phê, lá cây...',
    'Nên ủ làm phân bón (Compost) hoặc bỏ vào túi phân hủy sinh học.',
    'Có thể tái chế thành phân bón hữu cơ cho cây trồng.',
    'ORGANIC',
    'https://cdn-icons-png.flaticon.com/512/3299/3299908.png'
) ON CONFLICT (name) DO NOTHING;

-- 2. Rác thải nhựa (Plastic)
INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'plastic', 
    'Plastic waste (Rác nhựa): Chai lọ, túi nilon, hộp đựng...',
    'Rửa sạch, làm khô, nén nhỏ trước khi bỏ thùng tái chế.',
    'Tái chế thành hạt nhựa.',
    'PLASTIC',
    'https://cdn-icons-png.flaticon.com/512/812/812850.png'
) ON CONFLICT (name) DO NOTHING;

INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'Rác thải nhựa', 
    'Bao gồm chai nhựa (PET), túi nilon, hộp đựng thực phẩm...',
    'Rửa sạch thực phẩm thừa và làm khô trước khi bỏ vào thùng.',
    'Được nghiền nhỏ, làm sạch và nung chảy thành hạt nhựa.',
    'PLASTIC',
    'https://cdn-icons-png.flaticon.com/512/812/812850.png'
) ON CONFLICT (name) DO NOTHING;

-- 3. Rác thải điện tử (Electronic)
INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'electronic', 
    'E-waste (Rác điện tử): Pin, điện thoại hỏng, linh kiện...',
    'TUYỆT ĐỐI KHÔNG bỏ thùng rác sinh hoạt. Mang đến điểm thu gom chuyên dụng.',
    'Thu hồi kim loại quý và xử lý chất độc hại.',
    'ELECTRONIC',
    'https://cdn-icons-png.flaticon.com/512/911/911409.png'
) ON CONFLICT (name) DO NOTHING;

INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'Rác thải điện tử', 
    'Bao gồm pin, điện thoại hỏng, linh kiện máy tính...',
    'TUYỆT ĐỐI KHÔNG bỏ vào thùng rác sinh hoạt vì chứa chất độc hại.',
    'Được tháo dỡ để thu hồi các kim loại quý.',
    'ELECTRONIC',
    'https://cdn-icons-png.flaticon.com/512/911/911409.png'
) ON CONFLICT (name) DO NOTHING;

-- 4. Giấy (Paper)
INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'paper', 
    'Paper waste (Giấy): Sách báo, bìa carton, giấy văn phòng...',
    'Giữ khô ráo, không lẫn dầu mỡ. Buộc gọn gàng.',
    'Tái chế thành bột giấy.',
    'PAPER',
    'https://cdn-icons-png.flaticon.com/512/2541/2541988.png'
) ON CONFLICT (name) DO NOTHING;

INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'Giấy', 
    'Bao gồm sách báo cũ, bìa carton, giấy văn phòng...',
    'Giữ khô ráo, không để lẫn dầu mỡ hay thức ăn.',
    'Được nghiền thành bột giấy, tẩy mực và xeo thành giấy mới.',
    'PAPER',
    'https://cdn-icons-png.flaticon.com/512/2541/2541988.png'
) ON CONFLICT (name) DO NOTHING;

-- 5. Kim loại (Metal)
INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'metal', 
    'Metal waste (Kim loại): Vỏ lon, đồ hộp, sắt vụn...',
    'Rửa sạch thực phẩm thừa bên trong.',
    'Nung chảy để tái chế.',
    'METAL',
    'https://cdn-icons-png.flaticon.com/512/1008/1008986.png'
) ON CONFLICT (name) DO NOTHING;

INSERT INTO waste_categories (name, description, disposal_guideline, recycling_guideline, collection_point_type, icon_url)
VALUES (
    'Kim loại', 
    'Bao gồm vỏ lon nhôm, đồ hộp sắt, nồi chảo hỏng...',
    'Rửa sạch thực phẩm thừa bên trong lon/hộp.',
    'Được phân loại từ tính, nung chảy ở nhiệt độ cao.',
    'METAL',
    'https://cdn-icons-png.flaticon.com/512/1008/1008986.png'
) ON CONFLICT (name) DO NOTHING;