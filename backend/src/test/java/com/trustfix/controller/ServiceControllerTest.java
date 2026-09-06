package com.trustfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustfix.entity.Category;
import com.trustfix.entity.Service;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.dto.mapper.ServiceMapper;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.JwtService;
import com.trustfix.service.ServiceCatalogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

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

@WebMvcTest(ServiceController.class)
@AutoConfigureMockMvc(addFilters = false)
class ServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ServiceCatalogService serviceCatalogService;

    @SpyBean
    private ServiceMapper serviceMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;



    @Autowired
    private ObjectMapper objectMapper;

    private Category sampleCategory;
    private Service sampleService;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category("Plumbing", "Plumbing services", "https://example.com/plumbing.png");
        sampleCategory.setId(1L);

        sampleService = new Service("Pipe Repair", "Fix leaking pipes", new BigDecimal("50.00"), 60, sampleCategory);
        sampleService.setId(1L);
        sampleService.setActive(true);
    }

    @Test
    void createService_Success_Returns201() throws Exception {
        when(serviceCatalogService.createService(eq(1L), any(Service.class))).thenReturn(sampleService);

        mockMvc.perform(post("/api/services/category/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleService)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Pipe Repair"));
    }

    @Test
    void createService_CategoryNotFound_Returns404() throws Exception {
        when(serviceCatalogService.createService(eq(99L), any(Service.class)))
                .thenThrow(new ResourceNotFoundException("Category not found with ID: 99"));

        mockMvc.perform(post("/api/services/category/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleService)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getAllServices_Success_Returns200() throws Exception {
        when(serviceCatalogService.getAllServices()).thenReturn(List.of(sampleService));

        mockMvc.perform(get("/api/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Pipe Repair"));
    }

    @Test
    void getActiveServices_Success_Returns200() throws Exception {
        when(serviceCatalogService.getActiveServices()).thenReturn(List.of(sampleService));

        mockMvc.perform(get("/api/services/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Pipe Repair"));
    }

    @Test
    void getServiceById_Success_Returns200() throws Exception {
        when(serviceCatalogService.getServiceById(1L)).thenReturn(sampleService);

        mockMvc.perform(get("/api/services/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Pipe Repair"));
    }

    @Test
    void getServiceById_NotFound_Returns404() throws Exception {
        when(serviceCatalogService.getServiceById(99L))
                .thenThrow(new ResourceNotFoundException("Service not found with ID: 99"));

        mockMvc.perform(get("/api/services/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getServicesByCategoryId_Success_Returns200() throws Exception {
        when(serviceCatalogService.getServicesByCategoryId(1L)).thenReturn(List.of(sampleService));

        mockMvc.perform(get("/api/services/category/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Pipe Repair"));
    }

    @Test
    void getServicesByCategoryId_CategoryNotFound_Returns404() throws Exception {
        when(serviceCatalogService.getServicesByCategoryId(99L))
                .thenThrow(new ResourceNotFoundException("Category not found with ID: 99"));

        mockMvc.perform(get("/api/services/category/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void updateService_Success_Returns200() throws Exception {
        when(serviceCatalogService.updateService(eq(1L), any(Service.class))).thenReturn(sampleService);

        mockMvc.perform(put("/api/services/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleService)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void deactivateService_Success_Returns200() throws Exception {
        doNothing().when(serviceCatalogService).deactivateService(1L);

        mockMvc.perform(put("/api/services/1/deactivate"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteService_Success_Returns204() throws Exception {
        doNothing().when(serviceCatalogService).deleteService(1L);

        mockMvc.perform(delete("/api/services/1"))
                .andExpect(status().isNoContent());
    }
}
