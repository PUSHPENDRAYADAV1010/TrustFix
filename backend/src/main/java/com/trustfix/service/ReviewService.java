package com.trustfix.service;

import com.trustfix.entity.Booking;
import com.trustfix.entity.BookingStatus;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.Review;
import com.trustfix.entity.User;
import com.trustfix.exception.BadRequestException;
import com.trustfix.exception.ForbiddenException;
import com.trustfix.exception.ResourceAlreadyExistsException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.BookingRepository;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.ReviewRepository;
import com.trustfix.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final SecurityUtil securityUtil;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         ProviderProfileRepository providerProfileRepository,
                         SecurityUtil securityUtil) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.securityUtil = securityUtil;
    }

    public Review createReview(Long bookingId, Integer rating, String comment) {
        if (bookingId == null) {
            throw new BadRequestException("Booking ID is required to submit a review");
        }
        User authenticatedUser = securityUtil.getAuthenticatedUser();

        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!booking.getCustomer().getId().equals(authenticatedUser.getId()) && !securityUtil.isAdmin()) {
            throw new ForbiddenException("Unauthorized: You can only submit reviews for your own bookings");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted for COMPLETED bookings");
        }

        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new ResourceAlreadyExistsException("A review already exists for booking ID: " + bookingId);
        }

        if (booking.getProvider() == null) {
            throw new BadRequestException("Booking does not have an assigned provider to review");
        }

        Review review = new Review(booking, booking.getCustomer(), booking.getProvider(), rating, comment);
        Review savedReview = reviewRepository.save(review);

        updateProviderRatingStats(booking.getProvider().getId());

        return savedReview;
    }

    @Transactional(readOnly = true)
    public Review getReviewByBookingId(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for ID: " + bookingId));
        securityUtil.verifyBookingAccessOrAdmin(booking);

        return reviewRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found for booking ID: " + bookingId));
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewsByProviderId(Long providerId) {
        if (!providerProfileRepository.existsById(providerId)) {
            throw new ResourceNotFoundException("Provider profile not found with ID: " + providerId);
        }
        return reviewRepository.findByProviderId(providerId);
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewsByCustomerId(Long customerId) {
        securityUtil.verifyUserOwnershipOrAdmin(customerId);
        return reviewRepository.findByCustomerId(customerId);
    }

    private void updateProviderRatingStats(Long providerId) {
        ProviderProfile provider = providerProfileRepository.findById(providerId).orElse(null);
        if (provider != null) {
            List<Review> providerReviews = reviewRepository.findByProviderId(providerId);
            int count = providerReviews.size();
            double average = providerReviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);

            provider.setReviewCount(count);
            provider.setRating(Math.round(average * 100.0) / 100.0);
            providerProfileRepository.save(provider);
        }
    }
}
