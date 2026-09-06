package com.trustfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustfix.entity.Address;
import com.trustfix.entity.User;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.dto.mapper.AddressMapper;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.JwtService;
import com.trustfix.service.AddressService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AddressController.class)
@AutoConfigureMockMvc(addFilters = false)
class AddressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AddressService addressService;

    @SpyBean
    private AddressMapper addressMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;



    @Autowired
    private ObjectMapper objectMapper;

    private Address sampleAddress;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);

        sampleAddress = new Address(user, "123 Main St", "Cityville", "State", "123456");
        sampleAddress.setId(1L);
        sampleAddress.setDefaultAddress(true);
    }

    @Test
    void addAddress_Success_Returns201() throws Exception {
        when(addressService.addAddress(eq(1L), any(Address.class))).thenReturn(sampleAddress);

        mockMvc.perform(post("/api/addresses/user/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleAddress)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.addressLine1").value("123 Main St"));
    }

    @Test
    void addAddress_UserNotFound_Returns404() throws Exception {
        when(addressService.addAddress(eq(99L), any(Address.class)))
                .thenThrow(new ResourceNotFoundException("User not found with ID: 99"));

        mockMvc.perform(post("/api/addresses/user/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleAddress)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getAddressesByUserId_Success_Returns200() throws Exception {
        when(addressService.getAddressesByUserId(1L)).thenReturn(List.of(sampleAddress));

        mockMvc.perform(get("/api/addresses/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].addressLine1").value("123 Main St"));
    }

    @Test
    void getDefaultAddressByUserId_Success_Returns200() throws Exception {
        when(addressService.getDefaultAddressByUserId(1L)).thenReturn(Optional.of(sampleAddress));

        mockMvc.perform(get("/api/addresses/user/1/default"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.addressLine1").value("123 Main St"));
    }

    @Test
    void getDefaultAddressByUserId_NotFound_Returns404() throws Exception {
        when(addressService.getDefaultAddressByUserId(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/addresses/user/99/default"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getAddressById_Success_Returns200() throws Exception {
        when(addressService.getAddressById(1L)).thenReturn(sampleAddress);

        mockMvc.perform(get("/api/addresses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.addressLine1").value("123 Main St"));
    }

    @Test
    void updateAddress_Success_Returns200() throws Exception {
        when(addressService.updateAddress(eq(1L), any(Address.class))).thenReturn(sampleAddress);

        mockMvc.perform(put("/api/addresses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleAddress)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void setDefaultAddress_Success_Returns200() throws Exception {
        when(addressService.updateAddress(eq(1L), any(Address.class))).thenReturn(sampleAddress);

        mockMvc.perform(put("/api/addresses/1/default"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaultAddress").value(true));
    }

    @Test
    void deleteAddress_Success_Returns204() throws Exception {
        doNothing().when(addressService).deleteAddress(1L);

        mockMvc.perform(delete("/api/addresses/1"))
                .andExpect(status().isNoContent());
    }
}
