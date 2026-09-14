package com.trustfix.service;

import com.trustfix.dto.mapper.ProviderProfileMapper;
import com.trustfix.dto.provider.ProviderLocationResponse;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.exception.BadRequestException;
import com.trustfix.exception.ForbiddenException;
import com.trustfix.exception.ResourceAlreadyExistsException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.SecurityUtil;
import com.trustfix.util.HaversineDistanceUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
@SuppressWarnings("null")
public class ProviderProfileService {

    private final ProviderProfileRepository providerProfileRepository;
    private final UserRepository userRepository;
    private final ProviderProfileMapper providerProfileMapper;
    private final SecurityUtil securityUtil;

    public ProviderProfileService(ProviderProfileRepository providerProfileRepository,
                                  UserRepository userRepository,
                                  ProviderProfileMapper providerProfileMapper,
                                  SecurityUtil securityUtil) {
        this.providerProfileRepository = providerProfileRepository;
        this.userRepository = userRepository;
        this.providerProfileMapper = providerProfileMapper;
        this.securityUtil = securityUtil;
    }

    public ProviderProfile createProviderProfile(Long userId, ProviderProfile profile) {
        securityUtil.verifyUserOwnershipOrAdmin(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (providerProfileRepository.findByUserId(userId).isPresent()) {
            throw new ResourceAlreadyExistsException("Provider profile already exists for user ID: " + userId);
        }

        if (user.getRole() != UserRole.PROVIDER) {
            user.setRole(UserRole.PROVIDER);
            userRepository.save(user);
        }

        profile.setUser(user);
        if (profile.getVerificationStatus() == null) {
            profile.setVerificationStatus(VerificationStatus.PENDING);
        }
        return providerProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public ProviderProfile getProviderById(Long id) {
        return providerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public ProviderProfile getProviderByUserId(Long userId) {
        securityUtil.verifyUserOwnershipOrAdmin(userId);
        return providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user ID: " + userId));
    }

    @Transactional(readOnly = true)
    public List<ProviderProfile> getVerifiedProviders() {
        return providerProfileRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
    }

    @Transactional(readOnly = true)
    public List<ProviderProfile> getAvailableVerifiedProviders() {
        return providerProfileRepository.findByVerificationStatusAndAvailableTrue(VerificationStatus.VERIFIED);
    }

    @Transactional(readOnly = true)
    public List<ProviderLocationResponse> findNearbyProviders(Double customerLat, Double customerLng, Double radiusKm, Long serviceId) {
        if (customerLat == null || customerLng == null) {
            throw new BadRequestException("Latitude and longitude parameters are required for nearby provider search");
        }
        double maxRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 25.0;

        List<ProviderProfile> providers;
        if (serviceId != null) {
            providers = providerProfileRepository.findAvailableVerifiedProvidersByServiceId(VerificationStatus.VERIFIED, serviceId);
        } else {
            providers = providerProfileRepository.findByVerificationStatusAndAvailableTrue(VerificationStatus.VERIFIED);
        }

        return providers.stream()
                .map(provider -> {
                    double distance = HaversineDistanceUtil.calculateDistanceKm(customerLat, customerLng, provider.getLatitude(), provider.getLongitude());
                    double providerMaxRadius = provider.getServiceRadiusKm() != null ? provider.getServiceRadiusKm() : 25.0;
                    if (distance <= maxRadius && distance <= providerMaxRadius) {
                        return providerProfileMapper.toLocationResponse(provider, Math.round(distance * 100.0) / 100.0);
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(ProviderLocationResponse::getDistanceKm))
                .toList();
    }

    public ProviderProfile updateProviderProfile(Long providerId, ProviderProfile updatedDetails) {
        securityUtil.verifyProviderOwnershipOrAdmin(providerId);
        ProviderProfile existingProfile = getProviderById(providerId);

        if (updatedDetails.getBusinessName() != null) {
            existingProfile.setBusinessName(updatedDetails.getBusinessName());
        }
        if (updatedDetails.getBio() != null) {
            existingProfile.setBio(updatedDetails.getBio());
        }
        if (updatedDetails.getExperienceYears() != null) {
            existingProfile.setExperienceYears(updatedDetails.getExperienceYears());
        }
        if (updatedDetails.getDocumentUrl() != null) {
            existingProfile.setDocumentUrl(updatedDetails.getDocumentUrl());
        }
        if (updatedDetails.getLatitude() != null) {
            existingProfile.setLatitude(updatedDetails.getLatitude());
        }
        if (updatedDetails.getLongitude() != null) {
            existingProfile.setLongitude(updatedDetails.getLongitude());
        }
        if (updatedDetails.getServiceRadiusKm() != null) {
            existingProfile.setServiceRadiusKm(updatedDetails.getServiceRadiusKm());
        }
        if (updatedDetails.getCity() != null) {
            existingProfile.setCity(updatedDetails.getCity());
        }
        if (updatedDetails.getState() != null) {
            existingProfile.setState(updatedDetails.getState());
        }
        if (updatedDetails.getPostalCode() != null) {
            existingProfile.setPostalCode(updatedDetails.getPostalCode());
        }
        existingProfile.setAvailable(updatedDetails.isAvailable());

        return providerProfileRepository.save(existingProfile);
    }

    public ProviderProfile updateVerificationStatus(Long providerId, VerificationStatus status) {
        if (!securityUtil.isAdmin()) {
            throw new ForbiddenException("Only administrators can verify or reject service provider accounts");
        }
        if (status == null) {
            throw new BadRequestException("Verification status cannot be null");
        }
        ProviderProfile profile = getProviderById(providerId);
        profile.setVerificationStatus(status);
        return providerProfileRepository.save(profile);
    }
}
