package com.instagram_clone.controller;

import com.instagram_clone.service.*;

import com.instagram_clone.dto.CommentRequest;
import com.instagram_clone.dto.CommentResponse;
import com.instagram_clone.dto.ValidationGroups;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(@Validated(ValidationGroups.Create.class) @RequestBody CommentRequest request,
                                                         Authentication authentication) {
        CommentResponse createdComment = commentService.createComment(request, authentication.getName());
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@RequestParam(required = false) Long postId) {
        if (postId != null) {
            return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
        }
        return ResponseEntity.ok(commentService.getAllComments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable Long id,
                                                         @Validated(ValidationGroups.Update.class) @RequestBody CommentRequest request,
                                                         Authentication authentication) {
        return ResponseEntity.ok(commentService.updateComment(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComment(@PathVariable Long id,
                                                Authentication authentication) {
        commentService.deleteComment(id, authentication.getName());
        return ResponseEntity.ok("Comment deleted successfully");
    }
}
