package com.enviro.app.environment_backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    // Lấy đường dẫn thư mục upload từ application.yml (app.upload.dir)
    // Nếu không có thì mặc định là thư mục "uploads"
    @Value("${app.upload.dir:uploads}") 
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Tạo thư mục lưu trữ nếu chưa tồn tại
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Tạo tên file ngẫu nhiên để tránh trùng lặp
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalName.substring(dotIndex);
            }
            // Tên file mới: UUID + đuôi file cũ (ví dụ: a1b2-c3d4.jpg)
            String fileName = UUID.randomUUID().toString() + extension;

            // 3. Lưu file vào ổ cứng
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 4. Trả về đường dẫn URL để Frontend truy cập
            // Định dạng: /uploads/ten-file.jpg
            String fileUrl = "/uploads/" + fileName;
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi upload: " + e.getMessage()));
        }
    }
}