package com.instagram_clone.controller;

import com.instagram_clone.dto.PostRequest;
import com.instagram_clone.dto.PostResponse;
import com.instagram_clone.dto.ValidationGroups;
import com.instagram_clone.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Validated(ValidationGroups.Create.class) @RequestBody PostRequest request,
                                                   Authentication authentication) {
        PostResponse createdPost = postService.createPost(request, authentication.getName());
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id,
                                                   @Validated(ValidationGroups.Update.class) @RequestBody PostRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(postService.updatePost(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable Long id,
                                             Authentication authentication) {
        postService.deletePost(id, authentication.getName());
        return ResponseEntity.ok("Post deleted successfully");
    }

}