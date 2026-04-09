package com.instagram_clone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PostRequest {
    @NotBlank(message = "title is required", groups = ValidationGroups.Create.class)
    @Size(max = 200, message = "title must have at most 200 characters", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private String title;

    @NotBlank(message = "text is required", groups = ValidationGroups.Create.class)
    private String text;

    @NotBlank(message = "imageUrl is required", groups = ValidationGroups.Create.class)
    @Size(max = 500, message = "imageUrl must have at most 500 characters", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    @Pattern(regexp = "^(https?://).*$", message = "imageUrl must start with http or https", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private String imageUrl;

    public PostRequest() {}

    public PostRequest(String title, String text, String imageUrl) {
        this.title = title;
        this.text = text;
        this.imageUrl = imageUrl;
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

}