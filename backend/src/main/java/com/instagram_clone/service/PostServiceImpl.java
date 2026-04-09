package com.instagram_clone.service;

import com.instagram_clone.dto.PostRequest;
import com.instagram_clone.dto.PostResponse;
import com.instagram_clone.entity.Post;
import com.instagram_clone.entity.PostStatus;
import com.instagram_clone.repository.PostRepository;
import com.instagram_clone.repository.UserRepository;
import com.instagram_clone.exception.ResourceNotFoundException;
import com.instagram_clone.exception.UnauthorizedActionException;
import com.instagram_clone.exception.ConflictException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostServiceImpl(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public PostResponse createPost(PostRequest request, String requesterUsername) {
        com.instagram_clone.entity.User requester = getRequesterUser(requesterUsername);

        Post post = new Post();
        post.setUserId(requester.getId());
        post.setTitle(request.getTitle());
        post.setText(request.getText());
        post.setImageUrl(request.getImageUrl());

        post.setStatus(PostStatus.JUST_POSTED);

        try {
            Post savedPost = postRepository.save(post);
            return mapToResponse(savedPost);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("Invalid user_id for post creation");
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
                .orElseThrow(() -> new ResourceNotFoundException("Post with id " + id + " not found"));
        return mapToResponse(post);
    }

    @Override
    @Transactional
    public PostResponse updatePost(Long id, PostRequest request, String requesterUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post with id " + id + " not found"));
        com.instagram_clone.entity.User requester = getRequesterUser(requesterUsername);

        if (!post.getUserId().equals(requester.getId()) && !Boolean.TRUE.equals(requester.getIsModerator())) {
            throw new UnauthorizedActionException("User is not authorized to update this post");
        }

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }

        if (request.getText() != null) {
            post.setText(request.getText());
        }

        if (request.getImageUrl() != null) {
            post.setImageUrl(request.getImageUrl());
        }

        try {
            Post updatedPost = postRepository.save(post);
            return mapToResponse(updatedPost);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("Error updating post: database integrity violation");
        }
    }

    @Override
    @Transactional
    public void deletePost(Long id, String requesterUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post with id " + id + " not found"));
        com.instagram_clone.entity.User requester = getRequesterUser(requesterUsername);

        if (!post.getUserId().equals(requester.getId()) && !Boolean.TRUE.equals(requester.getIsModerator())) {
            throw new UnauthorizedActionException("User is not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    private com.instagram_clone.entity.User getRequesterUser(String requesterUsername) {
        return userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + requesterUsername));
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
