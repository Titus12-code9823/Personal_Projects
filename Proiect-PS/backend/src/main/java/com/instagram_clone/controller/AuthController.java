package com.instagram_clone.controller;

import com.instagram_clone.dto.ForgotPasswordRequest;
import com.instagram_clone.dto.ForgotPasswordResponse;
import com.instagram_clone.dto.LoginRequest;
import com.instagram_clone.dto.LoginResponse;
import com.instagram_clone.dto.ResetPasswordRequest;
import com.instagram_clone.repository.UserRepository;
import com.instagram_clone.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import com.instagram_clone.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final String frontendBaseUrl;

    public AuthController(
            UserService userService,
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            @Value("${app.frontend-url:http://localhost:4200}") String frontendBaseUrl
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.frontendBaseUrl = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername().trim(), request.getPassword())
            );

            UserDetails principal = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(principal);

            com.instagram_clone.entity.User user = userRepository.findByUsername(principal.getUsername())
                    .or(() -> userRepository.findByUsernameIgnoreCase(principal.getUsername()))
                    .orElseThrow(() -> new BadCredentialsException("User not found after authentication"));

            LoginResponse response = new LoginResponse(
                    token,
                    jwtService.extractExpiration(token),
                    user.getId(),
                    user.getUsername()
            );

            return ResponseEntity.ok(response);
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String resetToken = userService.requestPasswordReset(request.getEmail());
        String encodedToken = URLEncoder.encode(resetToken, StandardCharsets.UTF_8);
        String resetLink = frontendBaseUrl + "/reset-password?token=" + encodedToken;

        return ResponseEntity.ok(new ForgotPasswordResponse(resetToken, resetLink));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
