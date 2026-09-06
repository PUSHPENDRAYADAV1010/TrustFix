package com.trustfix.controller;

import com.trustfix.dto.AuthRequest;
import com.trustfix.dto.AuthResponse;
import com.trustfix.dto.auth.RegisterRequest;
import com.trustfix.dto.mapper.UserMapper;
import com.trustfix.dto.user.UserResponse;
import com.trustfix.entity.User;
import com.trustfix.repository.UserRepository;
import com.trustfix.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public AuthController(AuthService authService,
                          UserRepository userRepository,
                          UserMapper userMapper) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userMapper.toEntity(request);
        User registeredUser = authService.register(user);

        return new ResponseEntity<>(
                userMapper.toResponse(registeredUser),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request) {

        String token = authService.login(
                request.getEmail(),
                request.getPassword()
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new com.trustfix.exception.ResourceNotFoundException("User not found with email: " + request.getEmail()));

        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );

        return ResponseEntity.ok(response);
    }
}