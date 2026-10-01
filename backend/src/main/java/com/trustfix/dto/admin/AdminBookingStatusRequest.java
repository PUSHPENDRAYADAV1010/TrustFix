package com.trustfix.dto.admin;

import com.trustfix.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AdminBookingStatusRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    public AdminBookingStatusRequest() {
    }

    public AdminBookingStatusRequest(BookingStatus status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
