package com.instagram_clone.service;

import com.instagram_clone.dto.PostRequest;
import com.instagram_clone.dto.PostResponse;
import java.util.List;

public interface PostService {

    PostResponse createPost(PostRequest request, String requesterUsername);

    List<PostResponse> getAllPosts();

    PostResponse getPostById(Long id);

    PostResponse updatePost(Long id, PostRequest request, String requesterUsername);

    void deletePost(Long id, String requesterUsername);

}