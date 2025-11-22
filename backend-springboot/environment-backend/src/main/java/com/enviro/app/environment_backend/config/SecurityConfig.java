package com.enviro.app.environment_backend.config;

import java.util.Arrays;
import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; 
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import com.enviro.app.environment_backend.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return (HttpServletRequest request) -> {
            CorsConfiguration config = new CorsConfiguration();
            // Cho phép mọi nguồn (quan trọng khi gọi từ Mobile/Expo)
            config.setAllowedOrigins(Collections.singletonList("*"));
            // Cho phép mọi phương thức
            config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
            // Cho phép mọi header
            config.setAllowedHeaders(Collections.singletonList("*"));
            // Không dùng credentials khi allow origin *
            config.setAllowCredentials(false);
            config.setMaxAge(3600L);
            return config;
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(auth -> auth
                // 1. QUAN TRỌNG: Cho phép phương thức OPTIONS (Preflight request) đi qua
                // Nếu không có dòng này, điện thoại sẽ bị lỗi 403 khi kiểm tra kết nối
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // 2. Các API xác thực (Đăng nhập, Đăng ký, Quên mật khẩu)
                .requestMatchers("/api/auth/**").permitAll()
                
                // 3. Các API công khai khác (nếu có)
                .requestMatchers(HttpMethod.GET, "/api/aqi").permitAll() // Xem AQI không cần login
                .requestMatchers(HttpMethod.GET, "/api/categories").permitAll() // Danh mục rác
                .requestMatchers(HttpMethod.GET, "/api/collection-points").permitAll() // Điểm thu gom
                
                // 4. Tất cả các yêu cầu còn lại BẮT BUỘC phải có Token
                .anyRequest().authenticated()
            )
            
            // Đảm bảo Filter JWT chạy TRƯỚC khi kiểm tra bảo mật
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}