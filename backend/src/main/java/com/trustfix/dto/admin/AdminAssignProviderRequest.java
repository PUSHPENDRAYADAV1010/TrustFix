package com.trustfix.dto.admin;

import jakarta.validation.constraints.NotNull;

public class AdminAssignProviderRequest {

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    public AdminAssignProviderRequest() {
    }

    public AdminAssignProviderRequest(Long providerId) {
        this.providerId = providerId;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }
}
