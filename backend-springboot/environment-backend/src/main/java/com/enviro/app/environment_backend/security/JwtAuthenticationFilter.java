package com.enviro.app.environment_backend.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.enviro.app.environment_backend.service.CustomUserDetailsService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        final String requestPath = request.getRequestURI();
        final String method = request.getMethod();

        // [DEBUG LOG 1] Kiểm tra request đến
        System.out.println("------------------------------------------------");
        System.out.println(">>> 1. Incoming Request: " + method + " " + requestPath);

        final String authHeader = request.getHeader("Authorization");
        
        // [DEBUG LOG 2] Kiểm tra Header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println(">>> 2. No Valid Authorization Header found. Passing to next filter.");
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println(">>> 2. Authorization Header found.");
        final String jwt = authHeader.substring(7);
        String userEmail = null; 

        try {
            userEmail = jwtService.extractUsername(jwt);
            System.out.println(">>> 3. Extracted Email from Token: " + userEmail);
        } catch (Exception e) {
             System.out.println(">>> [ERROR] Token Extraction Failed: " + e.getMessage());
             // Đừng return ở đây vội, cứ để filter chain chạy tiếp để Security xử lý lỗi 403 chuẩn
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println(">>> 4. Loading UserDetails for: " + userEmail);
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail); 
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println(">>> 5. Authentication SUCCESS! User set in SecurityContext.");
            } else {
                System.out.println(">>> 5. [ERROR] Token is INVALID or Expired.");
            }
        } else {
            System.out.println(">>> 4. Skipped loading user (Email null or already authenticated).");
        }

        System.out.println(">>> 6. Continuing Filter Chain...");
        filterChain.doFilter(request, response);
    }
}