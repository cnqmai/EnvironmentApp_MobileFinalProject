package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.CommentRequest;
import com.enviro.app.environment_backend.dto.CommentResponse;
import com.enviro.app.environment_backend.dto.PostRequest;
import com.enviro.app.environment_backend.dto.PostResponse;
import com.enviro.app.environment_backend.model.Comment;
import com.enviro.app.environment_backend.model.Like;
import com.enviro.app.environment_backend.model.Post;
import com.enviro.app.environment_backend.model.User;
import com.enviro.app.environment_backend.repository.CommentRepository;
import com.enviro.app.environment_backend.repository.LikeRepository;
import com.enviro.app.environment_backend.repository.PostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service xử lý logic cho Community Posts (FR-8.x)
 */
@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;

    public PostService(PostRepository postRepository, 
                      CommentRepository commentRepository,
                      LikeRepository likeRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
    }

    /**
     * Tạo bài viết mới (FR-8.1.1)
     */
    @Transactional
    public PostResponse createPost(User user, PostRequest request) {
        Post newPost = Post.builder()
                .user(user)
                .content(request.getContent())
                .build();

        Post savedPost = postRepository.save(newPost);
        return mapToPostResponse(savedPost, user, false);
    }

    /**
     * Lấy tất cả posts (FR-8.1.1)
     */
    public List<PostResponse> getAllPosts(User currentUser) {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        
        return posts.stream()
                .map(post -> {
                    boolean isLiked = likeRepository.existsByUserAndPost(currentUser, post);
                    return mapToPostResponse(post, currentUser, isLiked);
                })
                .collect(Collectors.toList());
    }

    /**
     * Lấy post theo ID (FR-8.1.1)
     */
    public PostResponse getPostById(UUID postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, 
                    "Không tìm thấy bài viết với ID: " + postId
                ));
        
        boolean isLiked = likeRepository.existsByUserAndPost(currentUser, post);
        return mapToPostResponse(post, currentUser, isLiked);
    }

    /**
     * Like/Unlike một post (FR-8.1.2)
     */
    @Transactional
    public PostResponse toggleLike(UUID postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, 
                    "Không tìm thấy bài viết với ID: " + postId
                ));

        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            // Unlike - xóa like
            likeRepository.delete(existingLike.get());
        } else {
            // Like - tạo like mới
            Like newLike = Like.builder()
                    .user(user)
                    .post(post)
                    .build();
            likeRepository.save(newLike);
        }

        // Trả về post đã cập nhật
        boolean isLiked = likeRepository.existsByUserAndPost(user, post);
        return mapToPostResponse(post, user, isLiked);
    }

    /**
     * Thêm comment vào post (FR-8.1.2)
     */
    @Transactional
    public CommentResponse addComment(UUID postId, User user, CommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, 
                    "Không tìm thấy bài viết với ID: " + postId
                ));

        Comment newComment = Comment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .build();

        Comment savedComment = commentRepository.save(newComment);
        return mapToCommentResponse(savedComment);
    }

    /**
     * Lấy tất cả comments của một post (FR-8.1.2)
     */
    public List<CommentResponse> getPostComments(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, 
                    "Không tìm thấy bài viết với ID: " + postId
                ));

        List<Comment> comments = commentRepository.findByPostOrderByCreatedAtDesc(post);
        
        return comments.stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map Post entity sang PostResponse DTO
     */
    private PostResponse mapToPostResponse(Post post, User currentUser, boolean isLiked) {
        long likesCount = likeRepository.countByPost(post);
        long commentsCount = commentRepository.findByPostOrderByCreatedAtDesc(post).size();

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .userId(post.getUser().getId())
                .userFullName(post.getUser().getFullName())
                .userAvatarUrl(post.getUser().getAvatarUrl())
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .isLikedByCurrentUser(isLiked)
                .comments(null) // Không load comments mặc định để tránh N+1 problem
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    /**
     * Map Comment entity sang CommentResponse DTO
     */
    private CommentResponse mapToCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userId(comment.getUser().getId())
                .userFullName(comment.getUser().getFullName())
                .userAvatarUrl(comment.getUser().getAvatarUrl())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}

