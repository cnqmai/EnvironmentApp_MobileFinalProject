package com.enviro.app.environment_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // ==================================================================
        // BƯỚC QUAN TRỌNG NHẤT ĐỂ SỬA LỖI 403
        // ==================================================================
        // Nếu request không có Token (ví dụ: Đăng nhập, Đăng ký), 
        // ta KHÔNG ĐƯỢC chặn lại ở đây. Hãy cho nó đi tiếp (filterChain.doFilter)
        // để SecurityConfig quyết định (nếu là public endpoint thì sẽ cho qua).
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Nếu có Token, tiến hành giải mã và xác thực
        try {
            jwt = authHeader.substring(7); // Bỏ chữ "Bearer "
            userEmail = jwtService.extractUsername(jwt); // Lấy email từ token

            // Nếu lấy được email và chưa xác thực trong context hiện tại
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Lấy thông tin user từ DB
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // Kiểm tra token có hợp lệ không
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    
                    // Lưu thông tin xác thực vào SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Nếu Token bị lỗi (hết hạn, sai chữ ký...), ta chỉ log lỗi
            // và VẪN CHO request đi tiếp.
            // Lý do: Nếu endpoint cần bảo mật, SecurityConfig sẽ chặn sau (lỗi 403 chuẩn).
            // Nếu endpoint public, request vẫn được thực hiện.
            System.out.println("⚠️ JWT Filter Error: " + e.getMessage());
        }

        // Cho phép request đi tiếp đến bộ lọc tiếp theo
        filterChain.doFilter(request, response);
    }
}