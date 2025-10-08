package com.enviro.app.environment_backend.service;

import java.util.Collections;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Phương thức này được Spring Security gọi khi cần tìm User cho quá trình xác thực.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        
        // 1. Tìm kiếm User trong DB của bạn bằng email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // 2. Trả về đối tượng UserDetails mà Spring Security yêu cầu
        // Tên đăng nhập là email, mật khẩu đã hash là passwordHash, và không có quyền (Authorities)
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.emptyList() // Tạm thời không cần Authorities (Roles)
        );
    }
}