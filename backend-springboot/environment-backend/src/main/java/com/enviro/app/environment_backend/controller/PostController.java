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

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserService userService;

    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tìm thấy."));
    }

    /**
     * FR-8.1.1: Tạo bài viết mới
     */
    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request) {
        User user = getCurrentUser();
        PostResponse post = postService.createPost(user, request);
        return new ResponseEntity<>(post, HttpStatus.CREATED);
    }

    /**
     * FR-8.1.2: Lấy Feed chung (Hỗ trợ tab "Diễn đàn" trên Frontend)
     */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getCommunityFeed(
            @RequestParam(defaultValue = "all") String tab, // 'all', 'following', 'my'
            @RequestParam(required = false) UUID groupId) { // Lấy bài viết theo nhóm cụ thể
        
        User currentUser = getCurrentUser();
        
        // [CẬP NHẬT] Truyền tab vào service
        // LƯU Ý: logic lọc theo groupId CHƯA được hiện thực trong PostService
        List<PostResponse> posts = postService.getAllPosts(currentUser, tab); 
        
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        PostResponse post = postService.getPostById(id, currentUser);
        return ResponseEntity.ok(post);
    }

    /**
     * FR-8.1.2: Thả tim/Bỏ thả tim
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<PostResponse> toggleLike(@PathVariable UUID id) {
        User user = getCurrentUser();
        PostResponse post = postService.toggleLike(id, user);
        return ResponseEntity.ok(post);
    }

    /**
     * FR-8.1.2: Thêm bình luận
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
     * FR-8.1.2: Lấy danh sách bình luận
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getPostComments(@PathVariable UUID id) {
        List<CommentResponse> comments = postService.getPostComments(id);
        return ResponseEntity.ok(comments);
    }

    /**
     * [BỔ SUNG] Tăng số lượng chia sẻ (shares count)
     * POST /api/posts/{id}/share
     */
    @PostMapping("/{id}/share")
    public ResponseEntity<Void> trackShare(@PathVariable UUID id) {
        // Không cần getCurrentUser() vì đây là hành động đếm công khai
        postService.trackShare(id);
        return ResponseEntity.ok().build();
    }
}