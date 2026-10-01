package com.trustfix.repository;

import com.trustfix.entity.Booking;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByBooking(Booking booking);

    Optional<Review> findByBookingId(Long bookingId);

    List<Review> findByProvider(ProviderProfile provider);

    List<Review> findByProviderId(Long providerId);

    List<Review> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    List<Review> findByCustomerId(Long customerId);

    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    boolean existsByBookingId(Long bookingId);
}
