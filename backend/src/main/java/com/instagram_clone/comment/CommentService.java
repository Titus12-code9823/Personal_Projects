package com.instagram_clone.comment;

import com.instagram_clone.comment.dto.CommentRequest;
import com.instagram_clone.comment.dto.CommentResponse;

import java.util.List;

public interface CommentService {

    CommentResponse createComment(CommentRequest request);

    List<CommentResponse> getAllComments();

    List<CommentResponse> getCommentsByPostId(Long postId);

    CommentResponse getCommentById(Long id);

    CommentResponse updateComment(Long id, CommentRequest request, Long requesterUserId, boolean isModerator);

    void deleteComment(Long id, Long requesterUserId, boolean isModerator);
}
