package com.instagram_clone.dto;

import java.time.Instant;

public class LoginResponse {

    private String accessToken;
    private String tokenType;
    private Instant expiresAt;
    private Long userId;
    private String username;

    public LoginResponse() {
    }

    public LoginResponse(String accessToken, Instant expiresAt, Long userId, String username) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresAt = expiresAt;
        this.userId = userId;
        this.username = username;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
