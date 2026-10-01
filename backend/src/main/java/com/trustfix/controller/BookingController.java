package com.trustfix.controller;

import com.trustfix.dto.booking.BookingRequest;
import com.trustfix.dto.booking.BookingResponse;
import com.trustfix.dto.mapper.BookingMapper;
import com.trustfix.entity.Booking;
import com.trustfix.entity.BookingStatus;
import com.trustfix.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingMapper bookingMapper;

    public BookingController(BookingService bookingService, BookingMapper bookingMapper) {
        this.bookingService = bookingService;
        this.bookingMapper = bookingMapper;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) Long addressId,
            @RequestParam(required = false) Long providerId,
            @Valid @RequestBody(required = false) BookingRequest request) {
        
        Long finalCustomerId = customerId != null ? customerId : (request != null ? request.getCustomerId() : null);
        Long finalServiceId = serviceId != null ? serviceId : (request != null ? request.getServiceId() : null);
        Long finalAddressId = addressId != null ? addressId : (request != null ? request.getAddressId() : null);
        Long finalProviderId = providerId != null ? providerId : (request != null ? request.getProviderId() : null);

        if (finalCustomerId == null) {
            throw new com.trustfix.exception.BadRequestException("Customer ID is required");
        }
        if (finalServiceId == null) {
            throw new com.trustfix.exception.BadRequestException("Service ID is required");
        }
        if (finalAddressId == null) {
            throw new com.trustfix.exception.BadRequestException("Address ID is required");
        }

        Booking bookingToCreate = bookingMapper.toEntity(request);
        if (bookingToCreate == null) {
            bookingToCreate = new Booking();
        }
        Booking createdBooking = bookingService.createBooking(finalCustomerId, finalServiceId, finalAddressId, finalProviderId, bookingToCreate);
        return new ResponseEntity<>(bookingMapper.toResponse(createdBooking), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(bookingMapper.toResponse(booking));
    }

    @GetMapping("/reference/{bookingReference}")
    public ResponseEntity<BookingResponse> getBookingByReference(@PathVariable String bookingReference) {
        Booking booking = bookingService.getBookingByReference(bookingReference);
        return ResponseEntity.ok(bookingMapper.toResponse(booking));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByCustomer(@PathVariable Long customerId) {
        List<BookingResponse> bookings = bookingService.getBookingsByCustomer(customerId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByProvider(
            @PathVariable Long providerId,
            @RequestParam(required = false) BookingStatus status) {
        List<BookingResponse> bookings = bookingService.getBookingsByProvider(providerId, status)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BookingResponse>> getBookingsByStatus(@PathVariable BookingStatus status) {
        List<BookingResponse> bookings = bookingService.getBookingsByStatus(status)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) String cancellationReason) {
        String effectiveReason = reason != null ? reason : cancellationReason;
        Booking updatedBooking = (effectiveReason != null)
                ? bookingService.updateBookingStatus(id, status, effectiveReason)
                : bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(bookingMapper.toResponse(updatedBooking));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) com.trustfix.dto.booking.CancellationRequest request,
            @RequestParam(required = false) String reason) {
        String effectiveReason = request != null && request.getReason() != null ? request.getReason() : reason;
        Booking updatedBooking = bookingService.cancelBooking(id, effectiveReason);
        return ResponseEntity.ok(bookingMapper.toResponse(updatedBooking));
    }

    @PutMapping("/{id}/assign-provider")
    public ResponseEntity<BookingResponse> assignProvider(
            @PathVariable Long id,
            @RequestParam Long providerId) {
        Booking updatedBooking = bookingService.assignProvider(id, providerId);
        return ResponseEntity.ok(bookingMapper.toResponse(updatedBooking));
    }

    @PutMapping("/{id}/provider/{providerId}")
    public ResponseEntity<BookingResponse> assignProviderByPath(
            @PathVariable Long id,
            @PathVariable Long providerId) {
        Booking updatedBooking = bookingService.assignProvider(id, providerId);
        return ResponseEntity.ok(bookingMapper.toResponse(updatedBooking));
    }
}
