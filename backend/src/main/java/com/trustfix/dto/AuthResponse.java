package com.trustfix.dto;

public class AuthResponse {

    private String message;
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long userId, String name, String email, String role) {
        this(token, userId, name, email, role, "Login successful");
    }

    public AuthResponse(String token, Long userId, String name, String email, String role, String message) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.message = message != null ? message : "Login successful";
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
