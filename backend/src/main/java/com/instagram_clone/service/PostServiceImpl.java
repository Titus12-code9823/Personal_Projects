package com.instagram_clone.service;

import com.instagram_clone.dto.PostRequest;
import com.instagram_clone.dto.PostResponse;
import com.instagram_clone.entity.Post;
import com.instagram_clone.entity.PostStatus;
import com.instagram_clone.repository.PostRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;

    public PostServiceImpl(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Override
    public PostResponse createPost(PostRequest request) {
        validatePostRequest(request);

        Post post = new Post();
        post.setUserId(request.getUserId());
        post.setTitle(request.getTitle());
        post.setText(request.getText());
        post.setImageUrl(request.getImageUrl());

        post.setStatus(PostStatus.JUST_POSTED);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        try {
            Post savedPost = postRepository.save(post);
            return mapToResponse(savedPost);
        } catch (DataIntegrityViolationException ex) {
            throw new RuntimeException("Invalid user_id for post creation");
        }
    }

    @Override
    public List<PostResponse> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post with id " + id + " not found"));
        return mapToResponse(post);
    }

    @Override
    public PostResponse updatePost(Long id, PostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post with id " + id + " not found"));

        if (request.getTitle() != null) {
            if (request.getTitle().isBlank()) throw new RuntimeException("Title cannot be empty");
            post.setTitle(request.getTitle());
        }

        if (request.getText() != null) {
            post.setText(request.getText());
        }

        if (request.getImageUrl() != null) {
            post.setImageUrl(request.getImageUrl());
        }

        post.setUpdatedAt(LocalDateTime.now());

        try {
            Post updatedPost = postRepository.save(post);
            return mapToResponse(updatedPost);
        } catch (DataIntegrityViolationException ex) {
            throw new RuntimeException("Error updating post: database integrity violation");
        }
    }

    @Override
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post with id " + id + " not found"));
        postRepository.delete(post);
    }

    private void validatePostRequest(PostRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("userId is required");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Title is required");
        }
        if (request.getImageUrl() == null || request.getImageUrl().isBlank()) {
            throw new RuntimeException("Image URL is required for posts");
        }
        if (request.getImageUrl().length() > 500) {
            throw new RuntimeException("Image URL exceeds 500 characters");
        }
    }

    private PostResponse mapToResponse(Post post) {
        return new PostResponse(
                post.getId(),
                post.getUserId(),
                post.getTitle(),
                post.getText(),
                post.getImageUrl(),
                post.getStatus(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}