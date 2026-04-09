package com.instagram_clone.dto;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;


public class UserRequest {

    @NotBlank(message = "username is required", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    @Size(max = 50, message = "username must have at most 50 characters", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private String username;

    @NotBlank(message = "email is required", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    @Email(message = "email must be valid", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    @Size(max = 100, message = "email must have at most 100 characters", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private String email;

    @NotBlank(message = "password is required", groups = ValidationGroups.Create.class)
    @Size(max = 255, message = "password must have at most 255 characters", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private String password;

    @Size(max = 20, message = "phoneNumber must have at most 20 characters", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private String phoneNumber;

    @DecimalMin(value = "0.0", inclusive = true, message = "score must be >= 0", groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private BigDecimal score;
    private Boolean isModerator;
    private Boolean isBlocked;

    public UserRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(BigDecimal score) {
        this.score = score;
    }

    public Boolean getIsModerator() {
        return isModerator;
    }

    public void setIsModerator(Boolean isModerator) {
        this.isModerator = isModerator;
    }

    public Boolean getIsBlocked() {
        return isBlocked;
    }

    public void setIsBlocked(Boolean isBlocked) {
        this.isBlocked = isBlocked;
    }
}