package com.trustfix.dto.admin;

import jakarta.validation.constraints.Size;

public class AdminReviewModerationRequest {

    private boolean hidden;

    @Size(max = 500, message = "Moderation reason cannot exceed 500 characters")
    private String moderationReason;

    public AdminReviewModerationRequest() {
    }

    public AdminReviewModerationRequest(boolean hidden, String moderationReason) {
        this.hidden = hidden;
        this.moderationReason = moderationReason;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public String getModerationReason() {
        return moderationReason;
    }

    public void setModerationReason(String moderationReason) {
        this.moderationReason = moderationReason;
    }
}
