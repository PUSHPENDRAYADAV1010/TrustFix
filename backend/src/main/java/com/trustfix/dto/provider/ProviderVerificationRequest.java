package com.trustfix.dto.provider;

import com.trustfix.entity.VerificationStatus;
import jakarta.validation.constraints.Size;

public class ProviderVerificationRequest {

    private VerificationStatus status;

    @Size(max = 500, message = "Rejection reason cannot exceed 500 characters")
    private String rejectionReason;

    public ProviderVerificationRequest() {
    }

    public ProviderVerificationRequest(VerificationStatus status, String rejectionReason) {
        this.status = status;
        this.rejectionReason = rejectionReason;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
