package com.enviro.app.environment_backend.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;        // Cần import
import org.springframework.web.cors.CorsConfiguration;    // Cần import
import org.springframework.web.cors.CorsConfigurationSource; // Cần import
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;                                    // Cần import

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 1. PasswordEncoder Bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 2. CORS Configuration: Cho phép truy cập từ mọi origin trong môi trường Dev/Test.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép truy cập từ mọi domain/port (môi trường Dev)
        configuration.setAllowedOrigins(Arrays.asList("*")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho mọi đường dẫn
        return source;
    }

    /**
     * 3. SecurityFilterChain: Cấu hình quy tắc bảo mật
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Tích hợp CORS Configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Tắt CSRF (vì dùng JWT)
            .csrf(csrf -> csrf.disable())
            
            // Cấu hình Session: Đặt là STATELESS, bắt buộc cho REST API dùng JWT
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Cấu hình Authorization: Cho phép /api/auth/** là public, còn lại yêu cầu token
            .authorizeHttpRequests(auth -> auth
                // Cấu hình này sẽ hoạt động sau khi CORS và Tắt AutoConfig đã được áp dụng
                .requestMatchers("/api/auth/**").permitAll() 
                .anyRequest().authenticated()
            );

        // Tắt các cơ chế xác thực mặc định khác
        http.formLogin(form -> form.disable());
        http.httpBasic(basic -> basic.disable());

        return http.build();
    }
}