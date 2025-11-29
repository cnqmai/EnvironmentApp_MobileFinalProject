package com.enviro.app.environment_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
public class EnvironmentBackendApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.load(); // Load file .env
        if (dotenv.get("GOOGLE_CLIENT_ID") != null) {
            System.setProperty("GOOGLE_CLIENT_ID", dotenv.get("GOOGLE_CLIENT_ID"));
        }
        if (dotenv.get("GOOGLE_CLIENT_SECRET") != null) {
            System.setProperty("GOOGLE_CLIENT_SECRET", dotenv.get("GOOGLE_CLIENT_SECRET"));
        }
        if (dotenv.get("FACEBOOK_APP_ID") != null) {
            System.setProperty("FACEBOOK_APP_ID", dotenv.get("FACEBOOK_APP_ID"));
        }
        if (dotenv.get("FACEBOOK_APP_SECRET") != null) {
            System.setProperty("FACEBOOK_APP_SECRET", dotenv.get("FACEBOOK_APP_SECRET"));
        }
        if (dotenv.get("MAIL_USERNAME") != null) {
            System.setProperty("MAIL_USERNAME", dotenv.get("MAIL_USERNAME"));
        }
        if (dotenv.get("MAIL_PASSWORD") != null) {
            System.setProperty("MAIL_PASSWORD", dotenv.get("MAIL_PASSWORD"));
        }
        SpringApplication.run(EnvironmentBackendApplication.class, args);
    }

    /**
     * Bean này cung cấp RestTemplate cho AqiService sử dụng
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Giữ lại cấu hình context-path rỗng để tránh lỗi 404 cũ
     */
    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> webServerFactoryCustomizer() {
        return factory -> factory.setContextPath("");
    }
}