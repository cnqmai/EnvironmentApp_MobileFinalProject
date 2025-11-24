package com.enviro.app.environment_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;

@SpringBootApplication
public class EnvironmentBackendApplication {

    public static void main(String[] args) {
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