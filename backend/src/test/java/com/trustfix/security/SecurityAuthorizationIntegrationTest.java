package com.trustfix.security;

import com.trustfix.config.SecurityConfig;
import com.trustfix.controller.BookingController;
import com.trustfix.controller.CategoryController;
import com.trustfix.controller.ServiceController;
import com.trustfix.controller.UserController;
import com.trustfix.dto.mapper.BookingMapper;
import com.trustfix.dto.mapper.CategoryMapper;
import com.trustfix.dto.mapper.ServiceMapper;
import com.trustfix.dto.mapper.UserMapper;
import com.trustfix.repository.UserRepository;
import com.trustfix.service.BookingService;
import com.trustfix.service.CategoryService;
import com.trustfix.service.ServiceCatalogService;
import com.trustfix.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {UserController.class, BookingController.class, CategoryController.class, ServiceController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
class SecurityAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private UserMapper userMapper;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private BookingMapper bookingMapper;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private CategoryMapper categoryMapper;

    @MockBean
    private ServiceCatalogService serviceCatalogService;

    @MockBean
    private ServiceMapper serviceMapper;

    @MockBean
    private UserRepository userRepository;

    @Test
    @DisplayName("Unauthenticated request to protected endpoint should return 401 Unauthorized")
    void unauthenticatedRequest_ProtectedEndpoint_Returns401() throws Exception {
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Unauthenticated request to create booking should return 401 Unauthorized")
    void unauthenticatedRequest_CreateBooking_Returns401() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Request with invalid or malformed JWT token should return 401 Unauthorized")
    void malformedToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/users/1")
                        .header("Authorization", "Bearer invalid.malformed.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Public catalog endpoints should be accessible without authentication")
    void publicEndpoints_AccessibleWithoutAuth() throws Exception {
        when(categoryService.getAllCategories()).thenReturn(Collections.emptyList());
        when(serviceCatalogService.getAllServices()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/services"))
                .andExpect(status().isOk());
    }
}
