package com.trustfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustfix.entity.Address;
import com.trustfix.entity.Booking;
import com.trustfix.entity.BookingStatus;
import com.trustfix.entity.Category;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.Service;
import com.trustfix.entity.User;
import com.trustfix.exception.BadRequestException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.dto.mapper.BookingMapper;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.JwtService;
import com.trustfix.service.BookingService;
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
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingController.class)
@AutoConfigureMockMvc(addFilters = false)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @SpyBean
    private BookingMapper bookingMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;



    @Autowired
    private ObjectMapper objectMapper;

    private Booking sampleBooking;

    @BeforeEach
    void setUp() {
        User customer = new User();
        customer.setId(1L);

        Category category = new Category("Plumbing", "Plumbing desc", "icon");
        category.setId(1L);

        Service service = new Service("Pipe Repair", "Fix pipe", new BigDecimal("50.00"), 60, category);
        service.setId(1L);

        Address address = new Address(customer, "123 Main St", "City", "State", "123456");
        address.setId(1L);

        ProviderProfile provider = new ProviderProfile();
        provider.setId(1L);

        sampleBooking = new Booking(customer, service, address, java.time.LocalDate.now().plusDays(1), java.time.LocalTime.of(10, 0), new BigDecimal("50.00"));
        sampleBooking.setProvider(provider);
        sampleBooking.setId(1L);
        sampleBooking.setBookingReference("TB-12345678");
        sampleBooking.setStatus(BookingStatus.PENDING);
    }

    @Test
    void createBooking_Success_Returns201() throws Exception {
        when(bookingService.createBooking(eq(1L), eq(1L), eq(1L), eq(1L), any(Booking.class)))
                .thenReturn(sampleBooking);

        mockMvc.perform(post("/api/bookings")
                        .param("customerId", "1")
                        .param("serviceId", "1")
                        .param("addressId", "1")
                        .param("providerId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleBooking)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.bookingReference").value("TB-12345678"));
    }

    @Test
    void createBooking_CustomerNotFound_Returns404() throws Exception {
        when(bookingService.createBooking(eq(99L), eq(1L), eq(1L), eq(null), any(Booking.class)))
                .thenThrow(new ResourceNotFoundException("Customer not found with ID: 99"));

        mockMvc.perform(post("/api/bookings")
                        .param("customerId", "99")
                        .param("serviceId", "1")
                        .param("addressId", "1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getBookingById_Success_Returns200() throws Exception {
        when(bookingService.getBookingById(1L)).thenReturn(sampleBooking);

        mockMvc.perform(get("/api/bookings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingReference").value("TB-12345678"));
    }

    @Test
    void getBookingByReference_Success_Returns200() throws Exception {
        when(bookingService.getBookingByReference("TB-12345678")).thenReturn(sampleBooking);

        mockMvc.perform(get("/api/bookings/reference/TB-12345678"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getBookingsByCustomer_Success_Returns200() throws Exception {
        when(bookingService.getBookingsByCustomer(1L)).thenReturn(List.of(sampleBooking));

        mockMvc.perform(get("/api/bookings/customer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getBookingsByProvider_Success_Returns200() throws Exception {
        when(bookingService.getBookingsByProvider(1L)).thenReturn(List.of(sampleBooking));

        mockMvc.perform(get("/api/bookings/provider/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getBookingsByStatus_Success_Returns200() throws Exception {
        when(bookingService.getBookingsByStatus(BookingStatus.PENDING)).thenReturn(List.of(sampleBooking));

        mockMvc.perform(get("/api/bookings/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void updateBookingStatus_Success_Returns200() throws Exception {
        sampleBooking.setStatus(BookingStatus.CONFIRMED);
        when(bookingService.updateBookingStatus(1L, BookingStatus.CONFIRMED)).thenReturn(sampleBooking);

        mockMvc.perform(put("/api/bookings/1/status")
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void updateBookingStatus_AlreadyCompleted_Returns400() throws Exception {
        when(bookingService.updateBookingStatus(1L, BookingStatus.CANCELLED))
                .thenThrow(new BadRequestException("Cannot update status of a booking that is already COMPLETED"));

        mockMvc.perform(put("/api/bookings/1/status")
                        .param("status", "CANCELLED"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void assignProvider_Success_Returns200() throws Exception {
        when(bookingService.assignProvider(1L, 1L)).thenReturn(sampleBooking);

        mockMvc.perform(put("/api/bookings/1/assign-provider")
                        .param("providerId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }
}
