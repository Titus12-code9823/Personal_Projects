package com.instagram_clone.service;

import com.instagram_clone.repository.*;
import com.instagram_clone.entity.*;

import com.instagram_clone.dto.CommentRequest;
import com.instagram_clone.dto.CommentResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public CommentServiceImpl(CommentRepository commentRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public CommentResponse createComment(CommentRequest request, String requesterUsername) {

        User requester = getRequesterUser(requesterUsername);

        validateCommentText(request.getText());
        validateImageUrl(request.getImageUrl());

        Comment comment = new Comment();
        comment.setPostId(request.getPostId());
        comment.setUserId(requester.getId());
        comment.setText(request.getText());
        comment.setImageUrl(request.getImageUrl());

        try {
            Comment savedComment = commentRepository.save(comment);
            return mapToResponse(savedComment);
        } catch (DataIntegrityViolationException ex) {
            throw new com.instagram_clone.exception.ConflictException("Invalid post_id or user_id for comment");
        }
    }

    @Override
    public List<CommentResponse> getAllComments() {
        return commentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        return commentRepository.findByPost_IdOrderByVoteCountDesc(postId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CommentResponse getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new com.instagram_clone.exception.ResourceNotFoundException("Comment with id " + id + " not found"));
        return mapToResponse(comment);
    }

    @Override
    @Transactional
    public CommentResponse updateComment(Long id, CommentRequest request, String requesterUsername) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new com.instagram_clone.exception.ResourceNotFoundException("Comment with id " + id + " not found"));
        User requester = getRequesterUser(requesterUsername);

        if (!comment.getUserId().equals(requester.getId()) && !Boolean.TRUE.equals(requester.getIsModerator())) {
            throw new com.instagram_clone.exception.UnauthorizedActionException("User is not authorized to edit this comment");
        }

        if (request.getText() != null) {
            validateCommentText(request.getText());
            comment.setText(request.getText());
        }

        if (request.getImageUrl() != null) {
            validateImageUrl(request.getImageUrl());
            comment.setImageUrl(request.getImageUrl());
        }

        try {
            Comment updatedComment = commentRepository.save(comment);
            return mapToResponse(updatedComment);
        } catch (DataIntegrityViolationException ex) {
            throw new com.instagram_clone.exception.ConflictException("Invalid post_id or user_id for comment");
        }
    }

    @Override
    @Transactional
    public void deleteComment(Long id, String requesterUsername) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new com.instagram_clone.exception.ResourceNotFoundException("Comment with id " + id + " not found"));
        User requester = getRequesterUser(requesterUsername);
                
        if (!comment.getUserId().equals(requester.getId()) && !Boolean.TRUE.equals(requester.getIsModerator())) {
            throw new com.instagram_clone.exception.UnauthorizedActionException("User is not authorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    private void validateRequiredFields(CommentRequest request) {
        if (request.getPostId() == null) {
            throw new com.instagram_clone.exception.ConflictException("postId is required");
        }



    }

    private User getRequesterUser(String requesterUsername) {
        return userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new com.instagram_clone.exception.ResourceNotFoundException("Authenticated user not found: " + requesterUsername));
    }

    private void validateCommentText(String text) {
        if (text == null || text.isBlank()) {
            throw new com.instagram_clone.exception.ConflictException("Comment text is required and cannot be empty");
        }
        
        if (text.length() > 1000) {
            throw new com.instagram_clone.exception.ConflictException("Comment text exceeds maximum length of 1000 characters");
        }
    }

    private void validateImageUrl(String imageUrl) {
        if (imageUrl != null && imageUrl.length() > 500) {
            throw new com.instagram_clone.exception.ConflictException("Image URL exceeds maximum length of 500 characters");
        }

        if (imageUrl != null && !imageUrl.isBlank() && !imageUrl.startsWith("http")) {
            throw new com.instagram_clone.exception.ConflictException("Image URL must be a valid link starting with http or https");
        }
    }

    private CommentResponse mapToResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getPostId(),
                comment.getUserId(),
                comment.getText(),
                comment.getImageUrl(),
                comment.getVoteCount(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
