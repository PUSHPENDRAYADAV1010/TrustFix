package com.trustfix.dto.mapper;

import com.trustfix.dto.provider.ProviderLocationResponse;
import com.trustfix.dto.provider.ProviderProfileRequest;
import com.trustfix.dto.provider.ProviderProfileResponse;
import com.trustfix.entity.ProviderProfile;
import org.springframework.stereotype.Component;

@Component
public class ProviderProfileMapper {

    public ProviderProfile toEntity(ProviderProfileRequest request) {
        if (request == null) {
            return null;
        }
        ProviderProfile profile = new ProviderProfile();
        profile.setBusinessName(request.getBusinessName());
        profile.setBio(request.getBio());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setDocumentUrl(request.getDocumentUrl());
        profile.setLatitude(request.getLatitude());
        profile.setLongitude(request.getLongitude());
        if (request.getServiceRadiusKm() != null) {
            profile.setServiceRadiusKm(request.getServiceRadiusKm());
        }
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setPostalCode(request.getPostalCode());
        profile.setAvailable(request.isAvailable());
        return profile;
    }

    public ProviderProfileResponse toResponse(ProviderProfile profile) {
        if (profile == null) {
            return null;
        }
        return new ProviderProfileResponse(
                profile.getId(),
                profile.getUser() != null ? profile.getUser().getId() : null,
                profile.getUser() != null ? profile.getUser().getName() : null,
                profile.getUser() != null ? profile.getUser().getEmail() : null,
                profile.getUser() != null ? profile.getUser().getPhone() : null,
                profile.getBusinessName(),
                profile.getBio(),
                profile.getExperienceYears(),
                profile.getVerificationStatus(),
                profile.getRejectionReason(),
                profile.getDocumentUrl(),
                profile.getLatitude(),
                profile.getLongitude(),
                profile.getServiceRadiusKm(),
                profile.getCity(),
                profile.getState(),
                profile.getPostalCode(),
                profile.getRating(),
                profile.getReviewCount(),
                profile.isAvailable(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    public ProviderLocationResponse toLocationResponse(ProviderProfile profile, Double distanceKm) {
        if (profile == null) {
            return null;
        }
        return new ProviderLocationResponse(
                profile.getId(),
                profile.getBusinessName(),
                profile.getRating(),
                profile.getReviewCount(),
                profile.getLatitude(),
                profile.getLongitude(),
                profile.getServiceRadiusKm(),
                distanceKm,
                profile.isAvailable()
        );
    }
}
