package com.trustfix.service;

import com.trustfix.dto.booking.CancellationRequest;
import com.trustfix.entity.Address;
import com.trustfix.entity.Booking;
import com.trustfix.entity.BookingStatus;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.Service;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.exception.BadRequestException;
import com.trustfix.exception.ForbiddenException;
import com.trustfix.repository.AddressRepository;
import com.trustfix.repository.BookingRepository;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.ServiceRepository;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.SecurityUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProviderProfileRepository providerProfileRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private SecurityUtil securityUtil;

    @InjectMocks
    private BookingService bookingService;

    private User customer;
    private Service activeService;
    private Address customerAddress;
    private Booking booking;

    @BeforeEach
    void setUp() {
        customer = new User("Test Customer", "customer@example.com", "Secret@123", "9876543210", UserRole.CUSTOMER);
        customer.setId(10L);

        activeService = new Service("AC Repair", "Deep cleaning", new BigDecimal("599.00"), 60, null);
        activeService.setId(20L);
        activeService.setActive(true);

        customerAddress = new Address();
        customerAddress.setId(30L);
        customerAddress.setUser(customer);

        booking = new Booking();
        booking.setId(100L);
        booking.setCustomer(customer);
        booking.setService(activeService);
        booking.setAddress(customerAddress);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(new BigDecimal("599.00"));
    }

    @Test
    void createBooking_Success() {
        doNothing().when(securityUtil).verifyUserOwnershipOrAdmin(10L);
        when(securityUtil.isAdmin()).thenReturn(false);
        when(userRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(serviceRepository.findById(20L)).thenReturn(Optional.of(activeService));
        when(addressRepository.findById(30L)).thenReturn(Optional.of(customerAddress));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking newBooking = new Booking();
        newBooking.setBookingDate(LocalDate.now().plusDays(2));
        newBooking.setBookingTime(LocalTime.of(14, 0));

        Booking created = bookingService.createBooking(10L, 20L, 30L, null, newBooking);

        assertNotNull(created);
        assertEquals(BookingStatus.PENDING, created.getStatus());
        assertEquals(new BigDecimal("599.00"), created.getTotalAmount());
        assertEquals(customer, created.getCustomer());
    }

    @Test
    void createBooking_InactiveService_ThrowsBadRequestException() {
        activeService.setActive(false);
        doNothing().when(securityUtil).verifyUserOwnershipOrAdmin(10L);
        when(userRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(serviceRepository.findById(20L)).thenReturn(Optional.of(activeService));

        Booking newBooking = new Booking();
        newBooking.setBookingDate(LocalDate.now().plusDays(2));

        assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(10L, 20L, 30L, null, newBooking));
    }

    @Test
    void createBooking_AddressBelongsToAnother_ThrowsBadRequestException() {
        User anotherUser = new User();
        anotherUser.setId(99L);
        customerAddress.setUser(anotherUser);

        doNothing().when(securityUtil).verifyUserOwnershipOrAdmin(10L);
        when(userRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(serviceRepository.findById(20L)).thenReturn(Optional.of(activeService));
        when(addressRepository.findById(30L)).thenReturn(Optional.of(customerAddress));

        Booking newBooking = new Booking();
        newBooking.setBookingDate(LocalDate.now().plusDays(2));

        assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(10L, 20L, 30L, null, newBooking));
    }

    @Test
    void cancelBooking_WithReason_Success() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        doNothing().when(securityUtil).verifyBookingAccessOrAdmin(booking);
        when(securityUtil.getAuthenticatedUser()).thenReturn(customer);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking cancelled = bookingService.cancelBooking(100L, "Found alternative provider");

        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());
        assertEquals("Found alternative provider", cancelled.getCancellationReason());
    }

    @Test
    void cancelBooking_CustomerInProgressBooking_ThrowsForbiddenException() {
        booking.setStatus(BookingStatus.IN_PROGRESS);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        doNothing().when(securityUtil).verifyBookingAccessOrAdmin(booking);
        when(securityUtil.getAuthenticatedUser()).thenReturn(customer);

        assertThrows(ForbiddenException.class, () ->
                bookingService.cancelBooking(100L, "Cannot do it now"));
    }

    @Test
    void cancelBooking_AlreadyCompleted_ThrowsBadRequestException() {
        booking.setStatus(BookingStatus.COMPLETED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        doNothing().when(securityUtil).verifyBookingAccessOrAdmin(booking);
        when(securityUtil.getAuthenticatedUser()).thenReturn(customer);

        assertThrows(BadRequestException.class, () ->
                bookingService.cancelBooking(100L, "Too late"));
    }

    @Test
    void cancelBooking_AlreadyCancelled_ThrowsBadRequestException() {
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        doNothing().when(securityUtil).verifyBookingAccessOrAdmin(booking);
        when(securityUtil.getAuthenticatedUser()).thenReturn(customer);

        assertThrows(BadRequestException.class, () ->
                bookingService.cancelBooking(100L, "Already cancelled"));
    }

    @Test
    void cancelBooking_ReasonExceeds500Chars_ThrowsBadRequestException() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        doNothing().when(securityUtil).verifyBookingAccessOrAdmin(booking);
        when(securityUtil.getAuthenticatedUser()).thenReturn(customer);

        String longReason = "a".repeat(501);
        assertThrows(BadRequestException.class, () ->
                bookingService.cancelBooking(100L, longReason));
    }
}
