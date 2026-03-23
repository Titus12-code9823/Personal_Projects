package com.instagram_clone.service;

import com.instagram_clone.repository.*;
import com.instagram_clone.entity.*;

import com.instagram_clone.dto.CommentRequest;
import com.instagram_clone.dto.CommentResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;

    public CommentServiceImpl(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    @Override
    public CommentResponse createComment(CommentRequest request) {
        validateRequiredFields(request);

        Comment comment = new Comment();
        comment.setPostId(request.getPostId());
        comment.setUserId(request.getUserId());
        comment.setText(request.getText());
        comment.setImageUrl(request.getImageUrl());

        try {
            Comment savedComment = commentRepository.save(comment);
            return mapToResponse(savedComment);
        } catch (DataIntegrityViolationException ex) {
            throw new RuntimeException("Invalid post_id or user_id for comment");
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
        return commentRepository.findByPostIdOrderByVoteCountDesc(postId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CommentResponse getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment with id " + id + " not found"));
        return mapToResponse(comment);
    }

    @Override
    public CommentResponse updateComment(Long id, CommentRequest request, Long requesterUserId, boolean isModerator) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment with id " + id + " not found"));

        if (!comment.getUserId().equals(requesterUserId) && !isModerator) {
            throw new RuntimeException("User is not authorized to edit this comment");
        }

        if (request.getText() != null) {
            validateTextAndImage(request.getText(), request.getImageUrl());
            comment.setText(request.getText());
        }

        comment.setImageUrl(request.getImageUrl());

        try {
            Comment updatedComment = commentRepository.save(comment);
            return mapToResponse(updatedComment);
        } catch (DataIntegrityViolationException ex) {
            throw new RuntimeException("Invalid post_id or user_id for comment");
        }
    }

    @Override
    public void deleteComment(Long id, Long requesterUserId, boolean isModerator) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment with id " + id + " not found"));
                
        if (!comment.getUserId().equals(requesterUserId) && !isModerator) {
            throw new RuntimeException("User is not authorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    private void validateRequiredFields(CommentRequest request) {
        if (request.getPostId() == null) {
            throw new RuntimeException("postId is required");
        }

        if (request.getUserId() == null) {
            throw new RuntimeException("userId is required");
        }

        validateTextAndImage(request.getText(), request.getImageUrl());
    }

    private void validateTextAndImage(String text, String imageUrl) {
        if (text == null || text.isBlank()) {
            throw new RuntimeException("Comment text is required and cannot be empty");
        }
        
        if (text.length() > 1000) {
            throw new RuntimeException("Comment text exceeds maximum length of 1000 characters");
        }

        if (imageUrl != null && imageUrl.length() > 500) {
            throw new RuntimeException("Image URL exceeds maximum length of 500 characters");
        }

        if (imageUrl != null && !imageUrl.isBlank() && !imageUrl.startsWith("http")) {
            throw new RuntimeException("Image URL must be a valid link starting with http or https");
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
