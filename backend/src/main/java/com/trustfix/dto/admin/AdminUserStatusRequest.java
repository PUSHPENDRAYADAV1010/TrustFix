package com.trustfix.dto.admin;

import jakarta.validation.constraints.NotNull;

public class AdminUserStatusRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;

    public AdminUserStatusRequest() {
    }

    public AdminUserStatusRequest(Boolean active) {
        this.active = active;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
