package com.trustfix.repository;

import com.trustfix.entity.Booking;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    List<Review> findByProviderIdAndHiddenFalseOrderByCreatedAtDesc(Long providerId);

    List<Review> findByCustomerId(Long customerId);

    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    boolean existsByBookingId(Long bookingId);

    long countByHiddenFalse();

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.hidden = false")
    Double findAverageRatingAcrossPlatform();

    @Query("SELECT r FROM Review r WHERE " +
           "(:providerId IS NULL OR r.provider.id = :providerId) AND " +
           "(:hidden IS NULL OR r.hidden = :hidden) AND " +
           "(:minRating IS NULL OR r.rating >= :minRating) AND " +
           "(:maxRating IS NULL OR r.rating <= :maxRating)")
    Page<Review> findReviewsFiltered(
            @Param("providerId") Long providerId,
            @Param("hidden") Boolean hidden,
            @Param("minRating") Integer minRating,
            @Param("maxRating") Integer maxRating,
            Pageable pageable);
}
