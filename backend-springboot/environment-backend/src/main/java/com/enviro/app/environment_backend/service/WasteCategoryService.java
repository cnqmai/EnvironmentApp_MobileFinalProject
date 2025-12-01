package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.model.WasteCategory;
import com.enviro.app.environment_backend.repository.WasteCategoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WasteCategoryService {

    private final WasteCategoryRepository categoryRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WasteCategoryService(WasteCategoryRepository categoryRepository, GeminiService geminiService) {
        this.categoryRepository = categoryRepository;
        this.geminiService = geminiService;
    }

     @PostConstruct
    public void initData() {
        if (categoryRepository.count() == 0) {
             List<WasteCategory> defaults = Arrays.asList(
                // 1. Rác thải nhựa
                new WasteCategory(null, "Rác thải nhựa", 
                    "Các loại rác thải làm từ nhựa như chai, túi, bao bì nhựa", 
                    "Làm sạch chai/hộp nhựa, tháo nhãn mác (nếu có). Gom riêng và giao cho các điểm thu gom tái chế.", 
                    "Tái chế được 99% (PET, HDPE, PVC...). Có thể chuyển thành hạt nhựa, sợi tổng hợp hoặc vật liệu xây dựng.", 
                    "PLASTIC", null),

                // 2. Rác thải điện tử
                new WasteCategory(null, "Rác thải điện tử", 
                    "Các thiết bị điện tử hư hỏng như điện thoại, laptop, pin", 
                    "Tuyệt đối không được vứt vào thùng rác sinh hoạt. Thu gom và mang đến các điểm tiếp nhận chính thức để xử lý đúng quy trình.", 
                    "Các linh kiện chứa kim loại quý (vàng, bạc, đồng) và vật liệu có thể tái sử dụng. Cần được tháo dỡ bởi đơn vị chuyên môn.", 
                    "ELECTRONIC", null),

                // 3. Rác thải hữu cơ
                new WasteCategory(null, "Rác thải hữu cơ", 
                    "Rác thải có thể phân hủy như thức ăn thừa, lá cây", 
                    "Tách riêng khỏi các loại rác khác. Có thể dùng làm phân bón tại nhà hoặc chuyển đến các điểm thu gom hữu cơ chuyên biệt.", 
                    "Tái chế bằng phương pháp ủ phân (composting) để tạo ra phân bón hữu cơ chất lượng cao cho cây trồng.", 
                    "ORGANIC", null),

                // 4. Rác thải kim loại
                new WasteCategory(null, "Rác thải kim loại", 
                    "Các vật dụng kim loại như lon, sắt, nhôm", 
                    "Làm sạch, loại bỏ dầu mỡ (nếu có). Ép dẹt lon, hộp để tiết kiệm không gian. Thu gom riêng để giao cho cơ sở phế liệu.", 
                    "Tái chế 100% không giới hạn số lần. Kim loại được nung chảy và đúc thành sản phẩm mới.", 
                    "METAL", null),

                // 5. Rác thải thủy tinh
                new WasteCategory(null, "Rác thải thủy tinh", 
                    "Chai lọ, bình làm từ thủy tinh", 
                    "Rửa sạch, loại bỏ nắp nhựa/kim loại. Nếu vỡ, bọc kỹ bằng giấy báo và dán nhãn 'THỦY TINH VỠ' để đảm bảo an toàn.", 
                    "Tái chế bằng cách nghiền nát và nấu chảy để tạo ra chai lọ, gạch lát hoặc sợi thủy tinh mới.", 
                    "GLASS", null),

                // 6. Rác thải giấy
                new WasteCategory(null, "Rác thải giấy", 
                    "Giấy, bìa carton, sách báo cũ", 
                    "Thu gom giấy, bìa cứng khô ráo, không dính dầu mỡ/thức ăn. Ép phẳng hộp carton. Không bao gồm giấy vệ sinh đã qua sử dụng.", 
                    "Tái chế bằng cách nghiền thành bột giấy và ép thành giấy, hộp carton mới.", 
                    "PAPER", null),

                // 7. Rác thải nguy hại
                new WasteCategory(null, "Rác thải nguy hại", 
                    "Rác thải độc hại như hóa chất, pin, dầu nhớt", 
                    "Không bao giờ vứt vào thùng rác thông thường. Đóng gói kín và mang đến các điểm thu gom rác nguy hại để xử lý chuyên biệt.", 
                    "Ít khả năng tái chế trực tiếp. Chủ yếu là xử lý an toàn để trung hòa hóa chất độc hại.", 
                    "HAZARDOUS", null),

                // 8. Rác thải xây dựng
                new WasteCategory(null, "Rác thải xây dựng", 
                    "Vật liệu xây dựng thải bỏ như gạch, xi măng", 
                    "Cần liên hệ với các đơn vị dịch vụ thu gom rác xây dựng chuyên nghiệp. Không được đổ ở nơi công cộng.", 
                    "Có thể tái chế thành cốt liệu xây dựng (sỏi, cát nhân tạo) để dùng làm nền đường, vật liệu san lấp.", 
                    "CONSTRUCTION", null),

                // 9. Rác thải y tế
                new WasteCategory(null, "Rác thải y tế", 
                    "Rác thải từ bệnh viện, phòng khám", 
                    "Đóng gói kim tiêm, thuốc hết hạn vào hộp/túi riêng biệt có dán nhãn. Giao cho đơn vị xử lý rác y tế chuyên biệt.", 
                    "Các vật liệu lây nhiễm phải được xử lý bằng phương pháp tiệt trùng hoặc đốt ở nhiệt độ cao.", 
                    "MEDICAL", null),

                // 10. Rác thải khác
                new WasteCategory(null, "Rác thải khác", 
                    "Các loại rác thải không thuộc các danh mục trên", 
                    "Rác thải không thể tái chế (vải vụn bẩn, tã lót...). Vứt vào thùng rác sinh hoạt thông thường.", 
                    "Khả năng tái chế thấp. Phần lớn được đưa đến bãi chôn lấp hoặc nhà máy đốt rác.", 
                    "OTHER", null)
            );
            categoryRepository.saveAll(defaults);
        }
    }

    public List<WasteCategory> findAllCategories() {
        return categoryRepository.findAll();
    }

    // --- LOGIC TÌM KIẾM THÔNG MINH (DB + AI) ---
    public List<WasteCategory> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return new ArrayList<>();

        // 1. Tìm trong Database trước
        List<WasteCategory> dbResults = categoryRepository.searchByKeyword(keyword.trim());
        if (!dbResults.isEmpty()) {
            return dbResults;
        }

        // 2. Nếu DB không thấy -> Gọi AI
        System.out.println(">>> DB không tìm thấy '" + keyword + "'. Đang hỏi AI...");
        WasteCategory aiResult = classifyWasteByText(keyword);
        
        if (aiResult != null) {
            // Chấp nhận kết quả kể cả khi tên là "Không xác định" nếu có mô tả, 
            // nhưng tốt nhất là kiểm tra null
            return List.of(aiResult);
        }
        
        return new ArrayList<>();
    }

    // --- AI PHÂN TÍCH VĂN BẢN ---
    public WasteCategory classifyWasteByText(String description) {
        // Prompt được cải tiến để dễ tính hơn
        String prompt = String.format(
            "Bạn là chuyên gia tái chế. Hãy phân loại vật phẩm: '%s'. " +
            "Trả về JSON duy nhất (không markdown). " +
            "Nếu là 'hộp giấy', 'thùng carton' -> chọn PAPER. " +
            "Nếu là 'chai nhựa', 'vỏ chai' -> chọn PLASTIC. " +
            "Cấu trúc JSON: " +
            "{\"name\": \"Tên chính xác của vật phẩm (VD: Hộp giấy)\", " +
            "\"description\": \"Mô tả ngắn gọn về loại rác này\", " +
            "\"disposalGuideline\": \"Hướng dẫn xử lý (ngắn gọn, xuống dòng bằng \\n)\", " +
            "\"recyclingGuideline\": \"Có tái chế được không?\", " +
            "\"collectionPointType\": \"Chọn 1 trong: PAPER, PLASTIC, ORGANIC, METAL, GLASS, ELECTRONIC, HAZARDOUS, CONSTRUCTION, MEDICAL, OTHER\"}", 
            description
        );
        return processAiRequest(prompt, null);
    }

    // --- AI IMAGE (NÂNG CẤP) ---
    public WasteCategory classifyWasteByImage(MultipartFile image) {
        // Prompt được tối ưu để nhận diện hình ảnh tốt hơn
        String prompt = "Hãy đóng vai một chuyên gia tái chế rác thải tại Việt Nam. " +
                        "Hãy nhìn thật kỹ vào bức ảnh này và xác định vật phẩm chính trong ảnh là gì. " +
                        "1. Nếu là rác thải: Hãy phân loại nó và đưa ra hướng dẫn xử lý chính xác. " +
                        "2. Nếu ảnh mờ, không rõ hoặc không phải rác: Hãy trả về tên là 'Không xác định'. " +
                        "QUAN TRỌNG: Chỉ trả về chuỗi JSON thuần túy (không có markdown ```json), theo định dạng sau: " +
                        "{" +
                        "  \"name\": \"Tên vật phẩm (Tiếng Việt, ngắn gọn)\", " +
                        "  \"description\": \"Mô tả tình trạng vật phẩm trong ảnh (ví dụ: Chai nhựa đã qua sử dụng)\", " +
                        "  \"disposalGuideline\": \"Hướng dẫn chi tiết cách làm sạch, phân loại và vứt bỏ đúng quy định\", " +
                        "  \"recyclingGuideline\": \"Vật này có tái chế được không? Tái chế thành gì?\", " +
                        "  \"collectionPointType\": \"Chọn CHÍNH XÁC một trong các loại sau: ORGANIC, PLASTIC, PAPER, METAL, GLASS, ELECTRONIC, HAZARDOUS, CONSTRUCTION, MEDICAL, OTHER\"" +
                        "}";
        return processAiRequest(prompt, image);
    }

    private WasteCategory processAiRequest(String prompt, MultipartFile image) {
        String jsonResponse = (image != null) 
                ? geminiService.callGeminiWithImage(prompt, image) 
                : geminiService.callGemini(prompt);

        if (jsonResponse == null) return null;

        try {
            // Làm sạch chuỗi JSON triệt để hơn
            if (jsonResponse.contains("{")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("{"), jsonResponse.lastIndexOf("}") + 1);
            }
            
            WasteCategory aiCategory = objectMapper.readValue(jsonResponse, WasteCategory.class);
            aiCategory.setId(System.currentTimeMillis());
            return aiCategory;
        } catch (Exception e) {
            System.err.println("Lỗi parse JSON từ AI: " + e.getMessage());
            return null;
        }
    }
    
    public Optional<WasteCategory> findById(Long id) { return categoryRepository.findById(id); }
    public Optional<WasteCategory> findByName(String name) { return categoryRepository.findByNameIgnoreCase(name); }
}