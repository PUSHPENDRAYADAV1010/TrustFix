package com.trustfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustfix.dto.mapper.UserMapper;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.exception.BadRequestException;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.JwtAuthenticationFilter;
import com.trustfix.security.JwtService;
import com.trustfix.security.ratelimit.RateLimitingFilter;
import com.trustfix.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@SuppressWarnings("null")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @SpyBean
    private UserMapper userMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitingFilter rateLimitingFilter;

    @Autowired
    private ObjectMapper objectMapper;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Rahul Sharma", "rahul@example.com", "SecurePass123", "9876543210", UserRole.CUSTOMER);
        sampleUser.setId(1L);
    }

    @Test
    @DisplayName("Registration with valid data and strong password returns 201 Created")
    void register_ValidCustomer_Returns201() throws Exception {
        when(authService.register(any(User.class))).thenReturn(sampleUser);

        String validJson = """
                {
                    "name": "Rahul Sharma",
                    "email": "rahul@example.com",
                    "password": "SecurePassword123!",
                    "phone": "9876543210",
                    "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("rahul@example.com"))
                .andExpect(jsonPath("$.name").value("Rahul Sharma"));
    }

    @Test
    @DisplayName("Registration with password shorter than 8 characters returns 400 Bad Request")
    void register_TooShortPassword_Returns400() throws Exception {
        String shortPasswordJson = """
                {
                    "name": "Rahul Sharma",
                    "email": "rahul@example.com",
                    "password": "Sh1!",
                    "phone": "9876543210",
                    "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(shortPasswordJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("Registration missing uppercase letter in password returns 400 Bad Request")
    void register_MissingUppercase_Returns400() throws Exception {
        String noUpperJson = """
                {
                    "name": "Rahul Sharma",
                    "email": "rahul@example.com",
                    "password": "nouppercase123!",
                    "phone": "9876543210",
                    "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(noUpperJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("Registration missing number in password returns 400 Bad Request")
    void register_MissingNumber_Returns400() throws Exception {
        String noNumberJson = """
                {
                    "name": "Rahul Sharma",
                    "email": "rahul@example.com",
                    "password": "NoNumbersHere!",
                    "phone": "9876543210",
                    "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(noNumberJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("Registration with blank or null password returns 400 Bad Request")
    void register_BlankPassword_Returns400() throws Exception {
        String blankPasswordJson = """
                {
                    "name": "Rahul Sharma",
                    "email": "rahul@example.com",
                    "password": "",
                    "phone": "9876543210",
                    "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(blankPasswordJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("Registration with duplicate email returns 400 Bad Request")
    void register_DuplicateEmail_Returns400() throws Exception {
        when(authService.register(any(User.class)))
                .thenThrow(new BadRequestException("User with email 'rahul@example.com' already exists"));

        String json = """
                {
                    "name": "Rahul Sharma",
                    "email": "rahul@example.com",
                    "password": "SecurePassword123!",
                    "phone": "9876543210",
                    "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User with email 'rahul@example.com' already exists"));
    }

    @Test
    @DisplayName("Login with valid credentials returns 200 OK and JWT token")
    void login_ValidCredentials_Returns200() throws Exception {
        when(authService.login("rahul@example.com", "SecurePassword123!")).thenReturn("mocked.jwt.token");
        when(userRepository.findByEmail("rahul@example.com")).thenReturn(Optional.of(sampleUser));

        String loginJson = """
                {
                    "email": "rahul@example.com",
                    "password": "SecurePassword123!"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("rahul@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    @DisplayName("Login with invalid credentials returns 400 Bad Request")
    void login_InvalidCredentials_Returns400() throws Exception {
        when(authService.login("rahul@example.com", "WrongPassword123"))
                .thenThrow(new BadRequestException("Invalid email or password"));

        String loginJson = """
                {
                    "email": "rahul@example.com",
                    "password": "WrongPassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }
}
