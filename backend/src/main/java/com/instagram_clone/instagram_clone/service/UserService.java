package com.instagram_clone.instagram_clone.service;

import com.instagram_clone.instagram_clone.dto.UserRequest;
import com.instagram_clone.instagram_clone.dto.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);
}