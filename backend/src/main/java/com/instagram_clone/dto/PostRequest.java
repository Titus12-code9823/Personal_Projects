package com.instagram_clone.dto;

public class PostRequest {
    private String title;
    private String text;
    private String imageUrl;
    private Long userId;

    public PostRequest() {}

    public PostRequest(String title, String text, String imageUrl, Long userId) {
        this.title = title;
        this.text = text;
        this.imageUrl = imageUrl;
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}