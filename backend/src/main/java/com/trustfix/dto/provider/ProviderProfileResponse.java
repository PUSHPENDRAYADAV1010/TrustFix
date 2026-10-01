package com.trustfix.dto.provider;

import com.trustfix.entity.VerificationStatus;
import java.time.LocalDateTime;

public class ProviderProfileResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String businessName;
    private String bio;
    private Integer experienceYears;
    private VerificationStatus verificationStatus;
    private String rejectionReason;
    private String documentUrl;
    private Double latitude;
    private Double longitude;
    private Double serviceRadiusKm;
    private String city;
    private String state;
    private String postalCode;
    private Double rating;
    private Integer reviewCount;
    private boolean available;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProviderProfileResponse() {
    }

    public ProviderProfileResponse(Long id, Long userId, String userName, String userEmail, String userPhone, String businessName, String bio, Integer experienceYears, VerificationStatus verificationStatus, String documentUrl, Double rating, Integer reviewCount, boolean available, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPhone = userPhone;
        this.businessName = businessName;
        this.bio = bio;
        this.experienceYears = experienceYears;
        this.verificationStatus = verificationStatus;
        this.documentUrl = documentUrl;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.available = available;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public ProviderProfileResponse(Long id, Long userId, String userName, String userEmail, String userPhone, String businessName, String bio, Integer experienceYears, VerificationStatus verificationStatus, String rejectionReason, String documentUrl, Double latitude, Double longitude, Double serviceRadiusKm, String city, String state, String postalCode, Double rating, Integer reviewCount, boolean available, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPhone = userPhone;
        this.businessName = businessName;
        this.bio = bio;
        this.experienceYears = experienceYears;
        this.verificationStatus = verificationStatus;
        this.rejectionReason = rejectionReason;
        this.documentUrl = documentUrl;
        this.latitude = latitude;
        this.longitude = longitude;
        this.serviceRadiusKm = serviceRadiusKm;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.available = available;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getServiceRadiusKm() {
        return serviceRadiusKm;
    }

    public void setServiceRadiusKm(Double serviceRadiusKm) {
        this.serviceRadiusKm = serviceRadiusKm;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
