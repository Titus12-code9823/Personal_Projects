package com.instagram_clone.dto;


import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private Long postId;
    private Long userId;
    private String text;
    private String imageUrl;
    private Integer voteCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CommentResponse(Long id, Long postId, Long userId, String text, String imageUrl,
                           Integer voteCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.postId = postId;
        this.userId = userId;
        this.text = text;
        this.imageUrl = imageUrl;
        this.voteCount = voteCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getPostId() {
        return postId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getText() {
        return text;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Integer getVoteCount() {
        return voteCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
