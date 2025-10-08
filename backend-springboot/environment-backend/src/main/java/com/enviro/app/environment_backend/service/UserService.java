package com.enviro.app.environment_backend.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;

    // Sử dụng Constructor Injection
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Tìm kiếm người dùng bằng ID
     * @param id ID của người dùng
     * @return Optional chứa User nếu tìm thấy
     */
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    /**
     * Tìm kiếm người dùng bằng email. Cần thiết cho quá trình đăng nhập.
     * @param email Email của người dùng
     * @return Optional chứa User nếu tìm thấy
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Lưu một đối tượng User mới (hoặc cập nhật) vào cơ sở dữ liệu.
     * @param user Đối tượng User cần lưu
     * @return Đối tượng User đã được lưu
     */
    public User save(User user) {
        // Trong thực tế, bạn sẽ hash mật khẩu ở đây trước khi lưu
        return userRepository.save(user);
    }
}