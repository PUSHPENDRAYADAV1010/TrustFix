package com.trustfix.dto.admin;

import java.math.BigDecimal;
import java.util.Map;

public class AdminStatsResponse {

    private long totalUsers;
    private long totalCustomers;
    private long totalProviders;
    private Map<String, Long> providersByVerificationStatus;
    private Map<String, Long> bookingsByStatus;
    private long totalCategories;
    private long activeCategories;
    private long totalServices;
    private long activeServices;
    private long totalReviews;
    private double averagePlatformRating;
    private BigDecimal totalBookingValue;
    private double completionRate;
    private double cancellationRate;

    public AdminStatsResponse() {
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

    public Map<String, Long> getProvidersByVerificationStatus() {
        return providersByVerificationStatus;
    }

    public void setProvidersByVerificationStatus(Map<String, Long> providersByVerificationStatus) {
        this.providersByVerificationStatus = providersByVerificationStatus;
    }

    public Map<String, Long> getBookingsByStatus() {
        return bookingsByStatus;
    }

    public void setBookingsByStatus(Map<String, Long> bookingsByStatus) {
        this.bookingsByStatus = bookingsByStatus;
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

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public double getCancellationRate() {
        return cancellationRate;
    }

    public void setCancellationRate(double cancellationRate) {
        this.cancellationRate = cancellationRate;
    }
}
