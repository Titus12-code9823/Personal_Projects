package com.instagram_clone.dto;

public class ForgotPasswordResponse {
    private String resetToken;
    private String resetLink;

    public ForgotPasswordResponse() {
    }

    public ForgotPasswordResponse(String resetToken, String resetLink) {
        this.resetToken = resetToken;
        this.resetLink = resetLink;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getResetLink() {
        return resetLink;
    }

    public void setResetLink(String resetLink) {
        this.resetLink = resetLink;
    }
}
