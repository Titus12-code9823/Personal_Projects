package com.instagram_clone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CommentRequest {

    @NotNull(message = "postId is required", groups = ValidationGroups.Create.class)
    private Long postId;

    @NotBlank(message = "text is required", groups = ValidationGroups.Create.class)
    @Size(max = 1000, message = "text must have at most 1000 characters", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private String text;

    @Size(max = 500, message = "imageUrl must have at most 500 characters", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    @Pattern(regexp = "^(https?://).*$", message = "imageUrl must start with http or https", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private String imageUrl;

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
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
}
