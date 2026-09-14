package com.trustfix.controller;

import com.trustfix.dto.mapper.ProviderProfileMapper;
import com.trustfix.dto.provider.ProviderLocationResponse;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.JwtService;
import com.trustfix.service.ProviderProfileService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProviderProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
@SuppressWarnings("null")
class ProviderProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProviderProfileService providerProfileService;

    @SpyBean
    private ProviderProfileMapper providerProfileMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    private ProviderProfile sampleProfile;

    @BeforeEach
    void setUp() {
        User user = new User("Provider Bob", "bob@example.com", "password123", "9999988888", UserRole.PROVIDER);
        user.setId(2L);

        sampleProfile = new ProviderProfile(user, "Bob Plumbing", 5);
        sampleProfile.setId(1L);
        sampleProfile.setVerificationStatus(VerificationStatus.VERIFIED);
        sampleProfile.setLatitude(19.2183);
        sampleProfile.setLongitude(72.9781);
    }

    @Test
    void createProviderProfile_Success_Returns201() throws Exception {
        when(providerProfileService.createProviderProfile(eq(2L), any(ProviderProfile.class))).thenReturn(sampleProfile);

        String json = """
                {
                    "businessName": "Bob Plumbing",
                    "bio": "Expert plumbing services",
                    "experienceYears": 5
                }
                """;

        mockMvc.perform(post("/api/providers/user/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.businessName").value("Bob Plumbing"));
    }

    @Test
    void getProviderById_Success_Returns200() throws Exception {
        when(providerProfileService.getProviderById(1L)).thenReturn(sampleProfile);

        mockMvc.perform(get("/api/providers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.businessName").value("Bob Plumbing"));
    }

    @Test
    void getVerifiedProviders_Success_Returns200() throws Exception {
        when(providerProfileService.getVerifiedProviders()).thenReturn(List.of(sampleProfile));

        mockMvc.perform(get("/api/providers/verified"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].businessName").value("Bob Plumbing"));
    }

    @Test
    void getNearbyProviders_Success_Returns200() throws Exception {
        ProviderLocationResponse locResponse = new ProviderLocationResponse(1L, "Bob Plumbing", 4.8, 10, 19.2183, 72.9781, 25.0, 5.2, true);
        when(providerProfileService.findNearbyProviders(eq(19.0760), eq(72.8777), eq(25.0), eq(null))).thenReturn(List.of(locResponse));

        mockMvc.perform(get("/api/providers/nearby?lat=19.0760&lng=72.8777"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].providerId").value(1))
                .andExpect(jsonPath("$[0].businessName").value("Bob Plumbing"))
                .andExpect(jsonPath("$[0].distanceKm").value(5.2));
    }

    @Test
    void updateVerificationStatus_Success_Returns200() throws Exception {
        when(providerProfileService.updateVerificationStatus(1L, VerificationStatus.VERIFIED)).thenReturn(sampleProfile);

        mockMvc.perform(put("/api/providers/1/verify?status=VERIFIED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus").value("VERIFIED"));
    }
}
