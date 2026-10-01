package com.trustfix.repository;

import com.trustfix.entity.Booking;
import com.trustfix.entity.BookingStatus;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByCustomer(User customer);

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Booking> findByCustomerIdAndStatus(Long customerId, BookingStatus status);

    List<Booking> findByProvider(ProviderProfile provider);

    List<Booking> findByProviderId(Long providerId);

    List<Booking> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    List<Booking> findByProviderIdAndStatus(Long providerId, BookingStatus status);

    List<Booking> findByProviderIdAndStatusOrderByCreatedAtDesc(Long providerId, BookingStatus status);

    long countByProviderId(Long providerId);

    long countByProviderIdAndStatus(Long providerId, BookingStatus status);

    boolean existsByProviderIdAndServiceIdAndStatusIn(Long providerId, Long serviceId, List<BookingStatus> statuses);

    List<Booking> findByStatus(BookingStatus status);
}
