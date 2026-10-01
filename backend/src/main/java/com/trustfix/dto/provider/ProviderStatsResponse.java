package com.trustfix.dto.provider;

public class ProviderStatsResponse {

    private Long providerId;
    private long totalJobs;
    private long completedJobs;
    private long pendingJobs;
    private long inProgressJobs;
    private long cancelledJobs;
    private Double completionRate;
    private Double averageRating;
    private Integer reviewCount;

    public ProviderStatsResponse() {
    }

    public ProviderStatsResponse(Long providerId, long totalJobs, long completedJobs, long pendingJobs, long inProgressJobs, long cancelledJobs, Double completionRate, Double averageRating, Integer reviewCount) {
        this.providerId = providerId;
        this.totalJobs = totalJobs;
        this.completedJobs = completedJobs;
        this.pendingJobs = pendingJobs;
        this.inProgressJobs = inProgressJobs;
        this.cancelledJobs = cancelledJobs;
        this.completionRate = completionRate;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }

    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getCompletedJobs() {
        return completedJobs;
    }

    public void setCompletedJobs(long completedJobs) {
        this.completedJobs = completedJobs;
    }

    public long getPendingJobs() {
        return pendingJobs;
    }

    public void setPendingJobs(long pendingJobs) {
        this.pendingJobs = pendingJobs;
    }

    public long getInProgressJobs() {
        return inProgressJobs;
    }

    public void setInProgressJobs(long inProgressJobs) {
        this.inProgressJobs = inProgressJobs;
    }

    public long getCancelledJobs() {
        return cancelledJobs;
    }

    public void setCancelledJobs(long cancelledJobs) {
        this.cancelledJobs = cancelledJobs;
    }

    public Double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(Double completionRate) {
        this.completionRate = completionRate;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }
}
