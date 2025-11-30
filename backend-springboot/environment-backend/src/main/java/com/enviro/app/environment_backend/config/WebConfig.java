package com.enviro.app.environment_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Lấy đường dẫn thư mục upload từ file application.yml
    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Chuyển đường dẫn tương đối thành tuyệt đối để đảm bảo hoạt động trên mọi OS
        Path uploadPath = Paths.get(uploadDir);
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath();

        // Cấu hình: Khi truy cập URL /uploads/** -> Tìm trong thư mục vật lý
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/");
                
        System.out.println(">>> [WEB CONFIG] Mapping /uploads/** to: " + uploadAbsolutePath);
    }
}