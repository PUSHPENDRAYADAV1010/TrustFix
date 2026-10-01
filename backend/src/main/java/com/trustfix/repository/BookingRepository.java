package com.trustfix.repository;

import com.trustfix.entity.Booking;
import com.trustfix.entity.BookingStatus;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    long countByCustomerId(Long customerId);

    long countByStatus(BookingStatus status);

    boolean existsByProviderIdAndServiceIdAndStatusIn(Long providerId, Long serviceId, List<BookingStatus> statuses);

    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE " +
           "(:reference IS NULL OR LOWER(b.bookingReference) LIKE LOWER(CONCAT('%', :reference, '%'))) AND " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:customerId IS NULL OR b.customer.id = :customerId) AND " +
           "(:providerId IS NULL OR (b.provider IS NOT NULL AND b.provider.id = :providerId)) AND " +
           "(:bookingDate IS NULL OR b.bookingDate = :bookingDate)")
    Page<Booking> findBookingsFiltered(
            @Param("reference") String reference,
            @Param("status") BookingStatus status,
            @Param("customerId") Long customerId,
            @Param("providerId") Long providerId,
            @Param("bookingDate") LocalDate bookingDate,
            Pageable pageable);
}
