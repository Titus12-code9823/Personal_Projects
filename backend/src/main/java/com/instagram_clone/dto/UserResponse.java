package com.instagram_clone.dto;


import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Integer score;
    private Boolean isModerator;
    private Boolean isBlocked;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String username, String email, Integer score,
                        Boolean isModerator, Boolean isBlocked, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.score = score;
        this.isModerator = isModerator;
        this.isBlocked = isBlocked;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Integer getScore() {
        return score;
    }

    public Boolean getIsModerator() {
        return isModerator;
    }

    public Boolean getIsBlocked() {
        return isBlocked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public void setIsModerator(Boolean isModerator) {
        this.isModerator = isModerator;
    }

    public void setIsBlocked(Boolean isBlocked) {
        this.isBlocked = isBlocked;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
