package com.enviro.app.environment_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean; // Import mới
import org.springframework.web.client.RestTemplate; // Import mới
import org.springframework.scheduling.annotation.EnableScheduling; 
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
public class EnvironmentBackendApplication {

    public static void main(String[] args) {
        // Cấu hình Dotenv để không lỗi nếu thiếu file .env
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

        SpringApplication.run(EnvironmentBackendApplication.class, args);
    }

    // --- BỔ SUNG ĐOẠN NÀY ĐỂ FIX LỖI ---
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    // -----------------------------------
}