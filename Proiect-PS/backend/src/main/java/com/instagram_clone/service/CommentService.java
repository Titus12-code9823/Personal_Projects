package com.instagram_clone.service;

import com.instagram_clone.dto.CommentRequest;
import com.instagram_clone.dto.CommentResponse;

import java.util.List;

public interface CommentService {

    CommentResponse createComment(CommentRequest request, String requesterUsername);

    List<CommentResponse> getAllComments();

    List<CommentResponse> getCommentsByPostId(Long postId);

    CommentResponse getCommentById(Long id);

    CommentResponse updateComment(Long id, CommentRequest request, String requesterUsername);

    void deleteComment(Long id, String requesterUsername);
}
