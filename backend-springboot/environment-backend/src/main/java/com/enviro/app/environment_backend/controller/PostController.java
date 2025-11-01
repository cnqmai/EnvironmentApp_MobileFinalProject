package com.enviro.app.environment_backend.controller;

import com.enviro.app.environment_backend.dto.CommentRequest;
import com.enviro.app.environment_backend.dto.CommentResponse;
import com.enviro.app.environment_backend.dto.PostRequest;
import com.enviro.app.environment_backend.dto.PostResponse;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.service.PostService;
import com.enviro.app.environment_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Controller xử lý các API liên quan đến Community Posts (FR-8.x)
 */
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserService userService;

    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    /**
     * Phương thức tiện ích để lấy User đang đăng nhập từ JWT Token
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    /**
     * API TẠO BÀI VIẾT (FR-8.1.1)
     * POST /api/posts
     */
    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request) {
        User user = getCurrentUser();
        PostResponse post = postService.createPost(user, request);
        return new ResponseEntity<>(post, HttpStatus.CREATED);
    }

    /**
     * API LẤY TẤT CẢ BÀI VIẾT (FR-8.1.1)
     * GET /api/posts
     */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        User currentUser = getCurrentUser();
        List<PostResponse> posts = postService.getAllPosts(currentUser);
        return ResponseEntity.ok(posts);
    }

    /**
     * API LẤY BÀI VIẾT THEO ID (FR-8.1.1)
     * GET /api/posts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        PostResponse post = postService.getPostById(id, currentUser);
        return ResponseEntity.ok(post);
    }

    /**
     * API LIKE/UNLIKE BÀI VIẾT (FR-8.1.2)
     * POST /api/posts/{id}/like
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<PostResponse> toggleLike(@PathVariable UUID id) {
        User user = getCurrentUser();
        PostResponse post = postService.toggleLike(id, user);
        return ResponseEntity.ok(post);
    }

    /**
     * API THÊM BÌNH LUẬN (FR-8.1.2)
     * POST /api/posts/{id}/comments
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request) {
        User user = getCurrentUser();
        CommentResponse comment = postService.addComment(id, user, request);
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    /**
     * API LẤY BÌNH LUẬN CỦA BÀI VIẾT (FR-8.1.2)
     * GET /api/posts/{id}/comments
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getPostComments(@PathVariable UUID id) {
        List<CommentResponse> comments = postService.getPostComments(id);
        return ResponseEntity.ok(comments);
    }
}

