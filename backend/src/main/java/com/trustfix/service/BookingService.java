package com.trustfix.service;

import com.trustfix.entity.Address;
import com.trustfix.entity.Booking;
import com.trustfix.entity.BookingStatus;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.Service;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.exception.BadRequestException;
import com.trustfix.exception.ForbiddenException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.AddressRepository;
import com.trustfix.repository.BookingRepository;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.ServiceRepository;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.SecurityUtil;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@org.springframework.stereotype.Service
@Transactional
@SuppressWarnings("null")
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceRepository serviceRepository;
    private final AddressRepository addressRepository;
    private final SecurityUtil securityUtil;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          ProviderProfileRepository providerProfileRepository,
                          ServiceRepository serviceRepository,
                          AddressRepository addressRepository,
                          SecurityUtil securityUtil) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.serviceRepository = serviceRepository;
        this.addressRepository = addressRepository;
        this.securityUtil = securityUtil;
    }

    public Booking createBooking(Long customerId, Long serviceId, Long addressId, Long providerId, Booking booking) {
        securityUtil.verifyUserOwnershipOrAdmin(customerId);

        if (booking.getBookingDate() != null && booking.getBookingDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Booking date cannot be in the past");
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + serviceId));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId));

        if (!address.getUser().getId().equals(customerId)) {
            throw new BadRequestException("Selected address does not belong to customer ID: " + customerId);
        }

        if (providerId != null) {
            ProviderProfile provider = providerProfileRepository.findById(providerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Provider not found with ID: " + providerId));
            booking.setProvider(provider);
        }

        booking.setCustomer(customer);
        booking.setService(service);
        booking.setAddress(address);

        if (booking.getTotalAmount() == null) {
            booking.setTotalAmount(service.getBasePrice());
        }

        if (booking.getStatus() == null) {
            booking.setStatus(BookingStatus.PENDING);
        }

        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public Booking getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        securityUtil.verifyBookingAccessOrAdmin(booking);
        return booking;
    }

    @Transactional(readOnly = true)
    public Booking getBookingByReference(String bookingReference) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + bookingReference));
        securityUtil.verifyBookingAccessOrAdmin(booking);
        return booking;
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByCustomer(Long customerId) {
        securityUtil.verifyUserOwnershipOrAdmin(customerId);
        if (!userRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + customerId);
        }
        return bookingRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByProvider(Long providerId) {
        securityUtil.verifyProviderOwnershipOrAdmin(providerId);
        if (!providerProfileRepository.existsById(providerId)) {
            throw new ResourceNotFoundException("Provider profile not found with ID: " + providerId);
        }
        return bookingRepository.findByProviderId(providerId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        if (!securityUtil.isAdmin()) {
            throw new ForbiddenException("Only administrators can query platform bookings by status");
        }
        return bookingRepository.findByStatus(status);
    }

    public Booking updateBookingStatus(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        securityUtil.verifyBookingAccessOrAdmin(booking);

        User authenticatedUser = securityUtil.getAuthenticatedUser();
        BookingStatus currentStatus = booking.getStatus();

        // Check terminal states
        if (currentStatus == BookingStatus.COMPLETED || currentStatus == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot update status of a booking that is already " + currentStatus);
        }

        // Validate state transitions
        validateStatusTransition(currentStatus, newStatus);

        // Role-based status change restrictions
        if (authenticatedUser.getRole() == UserRole.CUSTOMER) {
            if (newStatus != BookingStatus.CANCELLED) {
                throw new ForbiddenException("Customers are only permitted to cancel pending or confirmed bookings");
            }
        } else if (authenticatedUser.getRole() == UserRole.PROVIDER) {
            boolean isAssignedProvider = booking.getProvider() != null &&
                    booking.getProvider().getUser() != null &&
                    booking.getProvider().getUser().getId().equals(authenticatedUser.getId());
            if (!isAssignedProvider) {
                throw new ForbiddenException("Providers can only update status for bookings assigned to them");
            }
        }

        if (newStatus == BookingStatus.CANCELLED && booking.getCancellationReason() == null) {
            booking.setCancellationReason("Cancelled by " + authenticatedUser.getRole().name().toLowerCase());
        }

        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }

    public Booking assignProvider(Long bookingId, Long providerId) {
        if (!securityUtil.isAdmin()) {
            throw new ForbiddenException("Only administrators can assign providers to arbitrary bookings");
        }
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        ProviderProfile provider = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with ID: " + providerId));

        booking.setProvider(provider);
        if (booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CONFIRMED);
        }

        return bookingRepository.save(booking);
    }

    private void validateStatusTransition(BookingStatus currentStatus, BookingStatus newStatus) {
        if (currentStatus == newStatus) {
            return;
        }
        if (newStatus == BookingStatus.CANCELLED) {
            if (currentStatus == BookingStatus.PENDING || currentStatus == BookingStatus.CONFIRMED || currentStatus == BookingStatus.IN_PROGRESS) {
                return;
            }
        }
        if (currentStatus == BookingStatus.PENDING && newStatus == BookingStatus.CONFIRMED) {
            return;
        }
        if (currentStatus == BookingStatus.CONFIRMED && newStatus == BookingStatus.IN_PROGRESS) {
            return;
        }
        if (currentStatus == BookingStatus.IN_PROGRESS && newStatus == BookingStatus.COMPLETED) {
            return;
        }
        throw new BadRequestException("Invalid booking status transition from " + currentStatus + " to " + newStatus);
    }
}
