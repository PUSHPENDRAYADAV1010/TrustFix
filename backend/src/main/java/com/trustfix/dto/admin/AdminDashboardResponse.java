package com.trustfix.dto.admin;

import java.math.BigDecimal;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalCustomers;
    private long totalProviders;
    private long verifiedProviders;
    private long pendingProviders;
    private long rejectedProviders;

    private long totalCategories;
    private long activeCategories;

    private long totalServices;
    private long activeServices;

    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long inProgressBookings;
    private long completedBookings;
    private long cancelledBookings;

    private long totalReviews;
    private double averagePlatformRating;

    private BigDecimal totalBookingValue;
    private double bookingCompletionRate;
    private double cancellationRate;

    public AdminDashboardResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalProviders() {
        return totalProviders;
    }

    public void setTotalProviders(long totalProviders) {
        this.totalProviders = totalProviders;
    }

    public long getVerifiedProviders() {
        return verifiedProviders;
    }

    public void setVerifiedProviders(long verifiedProviders) {
        this.verifiedProviders = verifiedProviders;
    }

    public long getPendingProviders() {
        return pendingProviders;
    }

    public void setPendingProviders(long pendingProviders) {
        this.pendingProviders = pendingProviders;
    }

    public long getRejectedProviders() {
        return rejectedProviders;
    }

    public void setRejectedProviders(long rejectedProviders) {
        this.rejectedProviders = rejectedProviders;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getActiveCategories() {
        return activeCategories;
    }

    public void setActiveCategories(long activeCategories) {
        this.activeCategories = activeCategories;
    }

    public long getTotalServices() {
        return totalServices;
    }

    public void setTotalServices(long totalServices) {
        this.totalServices = totalServices;
    }

    public long getActiveServices() {
        return activeServices;
    }

    public void setActiveServices(long activeServices) {
        this.activeServices = activeServices;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getConfirmedBookings() {
        return confirmedBookings;
    }

    public void setConfirmedBookings(long confirmedBookings) {
        this.confirmedBookings = confirmedBookings;
    }

    public long getInProgressBookings() {
        return inProgressBookings;
    }

    public void setInProgressBookings(long inProgressBookings) {
        this.inProgressBookings = inProgressBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public double getAveragePlatformRating() {
        return averagePlatformRating;
    }

    public void setAveragePlatformRating(double averagePlatformRating) {
        this.averagePlatformRating = averagePlatformRating;
    }

    public BigDecimal getTotalBookingValue() {
        return totalBookingValue;
    }

    public void setTotalBookingValue(BigDecimal totalBookingValue) {
        this.totalBookingValue = totalBookingValue;
    }

    public double getBookingCompletionRate() {
        return bookingCompletionRate;
    }

    public void setBookingCompletionRate(double bookingCompletionRate) {
        this.bookingCompletionRate = bookingCompletionRate;
    }

    public double getCancellationRate() {
        return cancellationRate;
    }

    public void setCancellationRate(double cancellationRate) {
        this.cancellationRate = cancellationRate;
    }
}
