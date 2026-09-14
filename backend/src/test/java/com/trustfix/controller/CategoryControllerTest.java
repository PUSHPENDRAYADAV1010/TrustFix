package com.trustfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustfix.entity.Category;
import com.trustfix.exception.ResourceAlreadyExistsException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.dto.mapper.CategoryMapper;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.JwtService;
import com.trustfix.service.CategoryService;
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

@WebMvcTest(CategoryController.class)
@AutoConfigureMockMvc(addFilters = false)
@SuppressWarnings("null")
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @SpyBean
    private CategoryMapper categoryMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;



    @Autowired
    private ObjectMapper objectMapper;

    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category("Plumbing", "Plumbing services", "https://example.com/plumbing.png");
        sampleCategory.setId(1L);
        sampleCategory.setActive(true);
    }

    @Test
    void createCategory_Success_Returns201() throws Exception {
        when(categoryService.createCategory(any(Category.class))).thenReturn(sampleCategory);

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleCategory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Plumbing"));
    }

    @Test
    void createCategory_AlreadyExists_Returns409() throws Exception {
        when(categoryService.createCategory(any(Category.class)))
                .thenThrow(new ResourceAlreadyExistsException("Category with name 'Plumbing' already exists"));

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleCategory)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    void getAllCategories_Success_Returns200() throws Exception {
        when(categoryService.getAllCategories()).thenReturn(List.of(sampleCategory));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Plumbing"));
    }

    @Test
    void getActiveCategories_Success_Returns200() throws Exception {
        when(categoryService.getActiveCategories()).thenReturn(List.of(sampleCategory));

        mockMvc.perform(get("/api/categories/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Plumbing"));
    }

    @Test
    void getCategoryById_Success_Returns200() throws Exception {
        when(categoryService.getCategoryById(1L)).thenReturn(sampleCategory);

        mockMvc.perform(get("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Plumbing"));
    }

    @Test
    void getCategoryById_NotFound_Returns404() throws Exception {
        when(categoryService.getCategoryById(99L))
                .thenThrow(new ResourceNotFoundException("Category not found with ID: 99"));

        mockMvc.perform(get("/api/categories/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getCategoryByName_Success_Returns200() throws Exception {
        when(categoryService.findByName("Plumbing")).thenReturn(Optional.of(sampleCategory));

        mockMvc.perform(get("/api/categories/name/Plumbing"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Plumbing"));
    }

    @Test
    void updateCategory_Success_Returns200() throws Exception {
        when(categoryService.updateCategory(eq(1L), any(Category.class))).thenReturn(sampleCategory);

        mockMvc.perform(put("/api/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleCategory)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void deactivateCategory_Success_Returns200() throws Exception {
        doNothing().when(categoryService).deactivateCategory(1L);

        mockMvc.perform(put("/api/categories/1/deactivate"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteCategory_Success_Returns204() throws Exception {
        doNothing().when(categoryService).deleteCategory(1L);

        mockMvc.perform(delete("/api/categories/1"))
                .andExpect(status().isNoContent());
    }
}
