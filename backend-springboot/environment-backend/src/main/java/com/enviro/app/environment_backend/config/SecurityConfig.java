package com.enviro.app.environment_backend.config;

import java.util.List;

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
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher; 
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector; 

import com.enviro.app.environment_backend.security.JwtAuthenticationFilter;
import com.enviro.app.environment_backend.security.JwtService;
import com.enviro.app.environment_backend.service.CustomUserDetailsService;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtService jwtService, CustomUserDetailsService customUserDetailsService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
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
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(false);
        config.setAllowedOrigins(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("*"));
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, HandlerMappingIntrospector introspector) throws Exception {
        MvcRequestMatcher.Builder mvc = new MvcRequestMatcher.Builder(introspector);

        JwtAuthenticationFilter jwtAuthFilter = new JwtAuthenticationFilter(jwtService, customUserDetailsService);

        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .exceptionHandling(e -> e
                .authenticationEntryPoint((request, response, authException) -> {
                    System.out.println(">>> [SECURITY BLOCK] Access Denied: " + authException.getMessage());
                    System.out.println(">>> Blocked URI: " + request.getRequestURI());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: " + authException.getMessage());
                })
            )

            .authorizeHttpRequests(auth -> auth
                // 1. Cho phép API AUTH
                .requestMatchers(mvc.pattern("/api/auth/**")).permitAll()
                .requestMatchers(mvc.pattern("/auth/**")).permitAll()
                
                // 2. Cho phép API AQI
                .requestMatchers(mvc.pattern("/api/aqi/**")).permitAll()
                .requestMatchers(mvc.pattern("/aqi/**")).permitAll()

                // >>> 3. THÊM DÒNG NÀY: CHO PHÉP TRUY CẬP ẢNH UPLOAD <<<
                .requestMatchers(mvc.pattern("/uploads/**")).permitAll()
                // ======================================================
                
                // 4. Cho phép trang lỗi
                .requestMatchers(mvc.pattern("/error")).permitAll()
                
                // 5. Cho phép OPTIONS (CORS)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // 6. Các request còn lại bắt buộc đăng nhập
                .anyRequest().authenticated()
            )
            
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}