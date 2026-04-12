package com.instagram_clone.service;

import com.instagram_clone.dto.UserRequest;
import com.instagram_clone.dto.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    List<UserResponse> getAllUsers(String requesterUsername);

    UserResponse getCurrentUser(String requesterUsername);

    UserResponse getUserById(Long id, String requesterUsername);

    UserResponse updateUser(Long id, UserRequest request, String requesterUsername);

    void deleteUser(Long id, String requesterUsername);

    String requestPasswordReset(String email);

    void resetPassword(String token, String newPassword);
}
