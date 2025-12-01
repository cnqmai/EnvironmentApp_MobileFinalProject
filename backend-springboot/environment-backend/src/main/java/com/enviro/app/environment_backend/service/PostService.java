package com.enviro.app.environment_backend.service;

import com.enviro.app.environment_backend.dto.CommentRequest;
import com.enviro.app.environment_backend.dto.CommentResponse;
import com.enviro.app.environment_backend.dto.PostRequest;
import com.enviro.app.environment_backend.dto.PostResponse;
import com.enviro.app.environment_backend.model.*;
import com.enviro.app.environment_backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommunityGroupRepository groupRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository, CommunityGroupRepository groupRepository, 
                       LikeRepository likeRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.groupRepository = groupRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    /**
     * FR-8.1.1: Tạo bài viết mới
     */
    @Transactional
    public PostResponse createPost(User user, PostRequest request) {
        CommunityGroup group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm."));
        }

        Post post = Post.builder()
                .user(user)
                .content(request.getContent())
                .group(group)
                .mediaUrls(request.getMediaUrls())
                .build();

        Post savedPost = postRepository.save(post);
        
        // Trả về post response sau khi tạo
        return mapToResponse(savedPost, user);
    }
    
    /**
     * FR-8.1.2: Lấy Feed chung (tab 'all') và tab 'my'
     */
    public List<PostResponse> getAllPosts(User currentUser, String tab) {
        List<Post> posts;
        
        if ("my".equalsIgnoreCase(tab)) {
             // Lấy posts của user hiện tại
            posts = postRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        } else {
            // Lấy tất cả posts (tab 'all')
            posts = postRepository.findAllByOrderByCreatedAtDesc();
        }

        return posts.stream()
                .map(post -> mapToResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    /**
     * FR-8.1.2: Lấy bài viết theo ID
     */
    public PostResponse getPostById(UUID postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết."));
        
        return mapToResponse(post, currentUser);
    }

    /**
     * FR-8.1.2: Thả tim/Bỏ thả tim
     */
    @Transactional
    public PostResponse toggleLike(UUID postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết."));

        // Sử dụng findByUserAndPost từ LikeRepository
        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post); 

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
        } else {
            // Lưu Like mới (LikeId là Primary Key composite)
            Like newLike = Like.builder().user(user).post(post).build();
            likeRepository.save(newLike);
        }

        // Tải lại Post để cập nhật count (để tránh lỗi Lazy loading nếu gọi trực tiếp .getLikes().size())
        Post updatedPost = postRepository.findById(postId).get();
        return mapToResponse(updatedPost, user);
    }
    
    /**
     * FR-8.1.2: Thêm bình luận
     */
    @Transactional
    public CommentResponse addComment(UUID postId, User user, CommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết."));
        
        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        
        return mapCommentToResponse(savedComment);
    }

    /**
     * FR-8.1.2: Lấy danh sách bình luận (sắp xếp theo thời gian mới nhất)
     */
    public List<CommentResponse> getPostComments(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết."));
        
        // Sử dụng findByPostOrderByCreatedAtDesc từ CommentRepository
        List<Comment> comments = commentRepository.findByPostOrderByCreatedAtDesc(post); 

        return comments.stream()
                .map(this::mapCommentToResponse)
                .collect(Collectors.toList());
    }


    // ====================================================================
    // MAPPERS
    // ====================================================================

    private PostResponse mapToResponse(Post post, User currentUser) {
        // Sử dụng existsByUserAndPost từ LikeRepository
        boolean isLiked = likeRepository.existsByUserAndPost(currentUser, post); 
        
        // Sử dụng countByPost từ LikeRepository
        long likesCount = likeRepository.countByPost(post); 
        
        // Cần truy cập Post Entity để đếm Comments nếu không dùng native query
        long commentsCount = commentRepository.countByPost(post); 

        Integer rawSharesCount = post.getSharesCount();
        long sharesCount = (rawSharesCount != null) ? rawSharesCount.longValue() : 0;
        
        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .groupId(post.getGroup() != null ? post.getGroup().getId() : null)
                .groupName(post.getGroup() != null ? post.getGroup().getName() : "Cộng đồng chung")
                .mediaUrls(post.getMediaUrls())
                .userId(post.getUser().getId())
                .userFullName(post.getUser().getFullName())
                .userAvatarUrl(post.getUser().getAvatarUrl()) 
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .sharesCount(sharesCount)
                .isLikedByCurrentUser(isLiked)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
    
    private CommentResponse mapCommentToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .postId(comment.getPost().getId())
                .userId(comment.getUser().getId())
                .userFullName(comment.getUser().getFullName())
                .userAvatarUrl(comment.getUser().getAvatarUrl())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                // Lưu ý: Các trường likesCount và isLikedByCurrentUser cho comments chưa được hiện thực logic
                .build();
    }
    
    @Transactional
    public void trackShare(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết."));
        
        // Xử lý NullPointerException (như đã sửa trước đó)
        Integer currentShares = post.getSharesCount();
        if (currentShares == null) {
            currentShares = 0;
        }

        post.setSharesCount(currentShares + 1);
        postRepository.save(post);
        // Lưu ý: Không cần trả về PostResponse, chỉ cần cập nhật thành công.
    }
}