package com.trustfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustfix.entity.Booking;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.Review;
import com.trustfix.entity.User;
import com.trustfix.exception.BadRequestException;
import com.trustfix.exception.ResourceAlreadyExistsException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.dto.mapper.ReviewMapper;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.JwtService;
import com.trustfix.service.ReviewService;
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

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReviewController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReviewService reviewService;

    @SpyBean
    private ReviewMapper reviewMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;



    @Autowired
    private ObjectMapper objectMapper;

    private Review sampleReview;

    @BeforeEach
    void setUp() {
        Booking booking = new Booking();
        booking.setId(1L);

        User customer = new User();
        customer.setId(1L);

        ProviderProfile provider = new ProviderProfile();
        provider.setId(1L);

        sampleReview = new Review(booking, customer, provider, 5, "Great service!");
        sampleReview.setId(1L);
    }

    @Test
    void createReviewForBooking_Success_Returns201() throws Exception {
        when(reviewService.createReview(1L, 5, "Great service!")).thenReturn(sampleReview);

        mockMvc.perform(post("/api/reviews/booking/1")
                        .param("rating", "5")
                        .param("comment", "Great service!"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Great service!"));
    }

    @Test
    void createReview_AlreadyExists_Returns409() throws Exception {
        when(reviewService.createReview(1L, 5, "Great service!"))
                .thenThrow(new ResourceAlreadyExistsException("A review already exists for booking ID: 1"));

        mockMvc.perform(post("/api/reviews/booking/1")
                        .param("rating", "5")
                        .param("comment", "Great service!"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    void createReview_InvalidRating_Returns400() throws Exception {
        when(reviewService.createReview(1L, 6, "Great service!"))
                .thenThrow(new BadRequestException("Rating must be between 1 and 5"));

        mockMvc.perform(post("/api/reviews/booking/1")
                        .param("rating", "6")
                        .param("comment", "Great service!"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void getReviewByBookingId_Success_Returns200() throws Exception {
        when(reviewService.getReviewByBookingId(1L)).thenReturn(sampleReview);

        mockMvc.perform(get("/api/reviews/booking/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5));
    }

    @Test
    void getReviewByBookingId_NotFound_Returns404() throws Exception {
        when(reviewService.getReviewByBookingId(99L))
                .thenThrow(new ResourceNotFoundException("Review not found for booking ID: 99"));

        mockMvc.perform(get("/api/reviews/booking/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getReviewsByProviderId_Success_Returns200() throws Exception {
        when(reviewService.getReviewsByProviderId(1L)).thenReturn(List.of(sampleReview));

        mockMvc.perform(get("/api/reviews/provider/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rating").value(5));
    }

    @Test
    void getReviewsByCustomerId_Success_Returns200() throws Exception {
        when(reviewService.getReviewsByCustomerId(1L)).thenReturn(List.of(sampleReview));

        mockMvc.perform(get("/api/reviews/customer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rating").value(5));
    }
}
