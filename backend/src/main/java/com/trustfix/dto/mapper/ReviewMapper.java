package com.trustfix.dto.mapper;

import com.trustfix.dto.review.ReviewResponse;
import com.trustfix.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        if (review == null) {
            return null;
        }
        ReviewResponse response = new ReviewResponse(
                review.getId(),
                review.getBooking() != null ? review.getBooking().getId() : null,
                review.getBooking() != null ? review.getBooking().getBookingReference() : null,
                review.getCustomer() != null ? review.getCustomer().getId() : null,
                review.getCustomer() != null ? review.getCustomer().getName() : null,
                review.getProvider() != null ? review.getProvider().getId() : null,
                review.getProvider() != null ? review.getProvider().getBusinessName() : null,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
        if (review.getBooking() != null && review.getBooking().getService() != null) {
            response.setServiceName(review.getBooking().getService().getName());
        }
        return response;
    }
}
