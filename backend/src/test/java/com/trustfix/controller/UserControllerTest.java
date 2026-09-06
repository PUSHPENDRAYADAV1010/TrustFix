package com.trustfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.exception.ResourceAlreadyExistsException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.dto.mapper.UserMapper;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.JwtService;
import com.trustfix.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @SpyBean
    private UserMapper userMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;



    @Autowired
    private ObjectMapper objectMapper;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Rahul Sharma", "rahul@example.com", "password123", "9876543210", UserRole.CUSTOMER);
        sampleUser.setId(1L);
    }

    @Test
    void createUser_Success_Returns201() throws Exception {
        when(userService.createUser(any(User.class))).thenReturn(sampleUser);

        String userJson = """
                {
                    "name": "Rahul Sharma",
                    "email": "rahul@example.com",
                    "password": "password123",
                    "phone": "9876543210",
                    "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("rahul@example.com"));
    }

    @Test
    void createUser_AlreadyExists_Returns409() throws Exception {
        when(userService.createUser(any(User.class)))
                .thenThrow(new ResourceAlreadyExistsException("User with email already exists"));

        String userJson = """
                {
                    "name": "Rahul Sharma",
                    "email": "rahul@example.com",
                    "password": "password123",
                    "phone": "9876543210",
                    "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }


    @Test
    void getUserById_Success_Returns200() throws Exception {
        when(userService.getUserById(1L)).thenReturn(sampleUser);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Rahul Sharma"));
    }

    @Test
    void getUserById_NotFound_Returns404() throws Exception {
        when(userService.getUserById(99L))
                .thenThrow(new ResourceNotFoundException("User not found with ID: 99"));

        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getUserByEmail_Success_Returns200() throws Exception {
        when(userService.findUserByEmail("rahul@example.com")).thenReturn(Optional.of(sampleUser));

        mockMvc.perform(get("/api/users/email/rahul@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("rahul@example.com"));
    }

    @Test
    void getUsersByRole_Success_Returns200() throws Exception {
        when(userService.getUsersByRole(UserRole.CUSTOMER)).thenReturn(List.of(sampleUser));

        mockMvc.perform(get("/api/users/role/CUSTOMER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].role").value("CUSTOMER"));
    }

    @Test
    void updateUser_Success_Returns200() throws Exception {
        when(userService.updateUser(eq(1L), any(User.class))).thenReturn(sampleUser);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void deleteUser_Success_Returns204() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }
}
