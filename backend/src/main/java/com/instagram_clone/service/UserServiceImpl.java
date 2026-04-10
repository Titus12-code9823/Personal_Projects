package com.instagram_clone.service;

import com.instagram_clone.dto.UserRequest;
import com.instagram_clone.dto.UserResponse;
import com.instagram_clone.entity.User;
import com.instagram_clone.exception.UserNotFoundException;
import com.instagram_clone.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new com.instagram_clone.exception.ConflictException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.instagram_clone.exception.ConflictException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDescription(request.getDescription());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setScore(BigDecimal.ZERO);
        user.setIsModerator(false);
        user.setIsBlocked(false);

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers(String requesterUsername) {
        User requester = getRequesterUser(requesterUsername);
        if (!Boolean.TRUE.equals(requester.getIsModerator())) {
            throw new AccessDeniedException("Only moderators can access all users");
        }

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public UserResponse getUserById(Long id, String requesterUsername) {
        User requester = getRequesterUser(requesterUsername);
        ensureSelfOrModerator(requester, id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));

        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request, String requesterUsername) {
        User requester = getRequesterUser(requesterUsername);
        ensureSelfOrModerator(requester, id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));

        if (!user.getUsername().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            throw new com.instagram_clone.exception.ConflictException("Username already exists");
        }

        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new com.instagram_clone.exception.ConflictException("Email already exists");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDescription(request.getDescription());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        boolean requestedAdminFieldUpdate = request.getScore() != null
                || request.getIsModerator() != null
                || request.getIsBlocked() != null;

        if (requestedAdminFieldUpdate && !Boolean.TRUE.equals(requester.getIsModerator())) {
            throw new AccessDeniedException("Only moderators can update administrative fields");
        }

        if (Boolean.TRUE.equals(requester.getIsModerator())) {
            if (request.getScore() != null) {
                user.setScore(request.getScore());
            }
            if (request.getIsModerator() != null) {
                user.setIsModerator(request.getIsModerator());
            }
            if (request.getIsBlocked() != null) {
                user.setIsBlocked(request.getIsBlocked());
            }
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id, String requesterUsername) {
        User requester = getRequesterUser(requesterUsername);
        ensureSelfOrModerator(requester, id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));

        userRepository.delete(user);
    }

    private User getRequesterUser(String requesterUsername) {
        return userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new com.instagram_clone.exception.ResourceNotFoundException(
                        "Authenticated user not found: " + requesterUsername));
    }

    private void ensureSelfOrModerator(User requester, Long targetUserId) {
        if (!requester.getId().equals(targetUserId) && !Boolean.TRUE.equals(requester.getIsModerator())) {
            throw new AccessDeniedException("User is not authorized for this action");
        }
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getDescription(),
                user.getScore(),
                user.getIsModerator(),
                user.getIsBlocked(),
                user.getCreatedAt()
        );
    }
}