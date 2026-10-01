package com.trustfix.dto.booking;

import jakarta.validation.constraints.Size;

public class CancellationRequest {

    @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters")
    private String reason;

    public CancellationRequest() {
    }

    public CancellationRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
