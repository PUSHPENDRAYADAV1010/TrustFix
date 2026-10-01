package com.trustfix.service;

import com.trustfix.dto.booking.BookingResponse;
import com.trustfix.dto.mapper.BookingMapper;
import com.trustfix.dto.mapper.ProviderProfileMapper;
import com.trustfix.dto.provider.ProviderDashboardResponse;
import com.trustfix.dto.provider.ProviderLocationResponse;
import com.trustfix.dto.provider.ProviderStatsResponse;
import com.trustfix.entity.BookingStatus;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.exception.BadRequestException;
import com.trustfix.exception.ForbiddenException;
import com.trustfix.exception.ResourceAlreadyExistsException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.BookingRepository;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.ProviderServiceRepository;
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
    private final BookingRepository bookingRepository;
    private final ProviderServiceRepository providerServiceRepository;
    private final BookingMapper bookingMapper;
    private final SecurityUtil securityUtil;

    public ProviderProfileService(ProviderProfileRepository providerProfileRepository,
                                  UserRepository userRepository,
                                  ProviderProfileMapper providerProfileMapper,
                                  BookingRepository bookingRepository,
                                  ProviderServiceRepository providerServiceRepository,
                                  BookingMapper bookingMapper,
                                  SecurityUtil securityUtil) {
        this.providerProfileRepository = providerProfileRepository;
        this.userRepository = userRepository;
        this.providerProfileMapper = providerProfileMapper;
        this.bookingRepository = bookingRepository;
        this.providerServiceRepository = providerServiceRepository;
        this.bookingMapper = bookingMapper;
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
        if (!securityUtil.isAdmin() || profile.getVerificationStatus() == null) {
            profile.setVerificationStatus(VerificationStatus.PENDING);
        }
        profile.setRating(0.0);
        profile.setReviewCount(0);
        profile.setRejectionReason(null);
        if (profile.getVerificationStatus() != VerificationStatus.VERIFIED) {
            profile.setAvailable(false);
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
            if (updatedDetails.getExperienceYears() < 0) {
                throw new BadRequestException("Experience years cannot be negative");
            }
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
            if (updatedDetails.getServiceRadiusKm() < 0) {
                throw new BadRequestException("Service radius cannot be negative");
            }
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

        // If provider was REJECTED, updating profile automatically resets to PENDING and clears rejection reason
        if (existingProfile.getVerificationStatus() == VerificationStatus.REJECTED) {
            existingProfile.setVerificationStatus(VerificationStatus.PENDING);
            existingProfile.setRejectionReason(null);
            existingProfile.setAvailable(false);
        } else if (existingProfile.getVerificationStatus() != VerificationStatus.VERIFIED && updatedDetails.isAvailable()) {
            throw new BadRequestException("Provider must be verified before setting status to available");
        } else if (existingProfile.getVerificationStatus() == VerificationStatus.VERIFIED) {
            existingProfile.setAvailable(updatedDetails.isAvailable());
        }

        return providerProfileRepository.save(existingProfile);
    }

    public ProviderProfile updateAvailability(Long providerId, boolean available) {
        securityUtil.verifyProviderOwnershipOrAdmin(providerId);
        ProviderProfile existingProfile = getProviderById(providerId);

        if (available && existingProfile.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException("Provider must be verified before setting status to available");
        }

        existingProfile.setAvailable(available);
        return providerProfileRepository.save(existingProfile);
    }

    public ProviderProfile updateVerificationStatus(Long providerId, VerificationStatus status) {
        return updateVerificationStatus(providerId, status, null);
    }

    public ProviderProfile updateVerificationStatus(Long providerId, VerificationStatus status, String rejectionReason) {
        if (!securityUtil.isAdmin()) {
            throw new ForbiddenException("Only administrators can verify or reject service provider accounts");
        }
        if (status == null) {
            throw new BadRequestException("Verification status cannot be null");
        }
        ProviderProfile profile = getProviderById(providerId);

        if (status == VerificationStatus.REJECTED) {
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                throw new BadRequestException("Rejection reason is required when rejecting a provider account");
            }
            if (rejectionReason.trim().length() > 500) {
                throw new BadRequestException("Rejection reason cannot exceed 500 characters");
            }
            profile.setVerificationStatus(VerificationStatus.REJECTED);
            profile.setRejectionReason(rejectionReason.trim());
            profile.setAvailable(false);
        } else if (status == VerificationStatus.VERIFIED) {
            profile.setVerificationStatus(VerificationStatus.VERIFIED);
            profile.setRejectionReason(null);
        } else if (status == VerificationStatus.PENDING) {
            profile.setVerificationStatus(VerificationStatus.PENDING);
            profile.setRejectionReason(null);
            profile.setAvailable(false);
        }

        return providerProfileRepository.save(profile);
    }

    public ProviderProfile reapplyForVerification(Long providerId) {
        securityUtil.verifyProviderOwnershipOrAdmin(providerId);
        ProviderProfile profile = getProviderById(providerId);

        if (profile.getVerificationStatus() != VerificationStatus.REJECTED) {
            throw new BadRequestException("Can only reapply for verification when the current status is REJECTED");
        }

        profile.setVerificationStatus(VerificationStatus.PENDING);
        profile.setRejectionReason(null);
        profile.setAvailable(false);
        return providerProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public ProviderDashboardResponse getProviderDashboard(Long providerId) {
        securityUtil.verifyProviderOwnershipOrAdmin(providerId);
        ProviderProfile profile = getProviderById(providerId);

        long totalBookings = bookingRepository.countByProviderId(providerId);
        long pendingBookings = bookingRepository.countByProviderIdAndStatus(providerId, BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByProviderIdAndStatus(providerId, BookingStatus.CONFIRMED);
        long inProgressBookings = bookingRepository.countByProviderIdAndStatus(providerId, BookingStatus.IN_PROGRESS);
        long completedBookings = bookingRepository.countByProviderIdAndStatus(providerId, BookingStatus.COMPLETED);
        long cancelledBookings = bookingRepository.countByProviderIdAndStatus(providerId, BookingStatus.CANCELLED);
        long activeServices = providerServiceRepository.countByProviderIdAndAvailableTrue(providerId);

        double completionRate = 0.0;
        if (completedBookings + cancelledBookings > 0) {
            completionRate = Math.round(((double) completedBookings / (completedBookings + cancelledBookings)) * 1000.0) / 10.0;
        } else if (totalBookings > 0) {
            completionRate = Math.round(((double) completedBookings / totalBookings) * 1000.0) / 10.0;
        }

        List<BookingResponse> recentBookings = bookingRepository.findByProviderIdOrderByCreatedAtDesc(providerId)
                .stream()
                .limit(5)
                .map(bookingMapper::toResponse)
                .toList();

        ProviderDashboardResponse response = new ProviderDashboardResponse();
        response.setProviderId(profile.getId());
        response.setBusinessName(profile.getBusinessName());
        response.setVerificationStatus(profile.getVerificationStatus());
        response.setRejectionReason(profile.getRejectionReason());
        response.setAvailable(profile.isAvailable());
        response.setRating(profile.getRating());
        response.setReviewCount(profile.getReviewCount());
        response.setActiveServicesCount(activeServices);
        response.setTotalBookings(totalBookings);
        response.setPendingBookings(pendingBookings);
        response.setConfirmedBookings(confirmedBookings);
        response.setInProgressBookings(inProgressBookings);
        response.setCompletedBookings(completedBookings);
        response.setCancelledBookings(cancelledBookings);
        response.setCompletionRate(completionRate);
        response.setRecentBookings(recentBookings);

        return response;
    }

    @Transactional(readOnly = true)
    public ProviderStatsResponse getProviderStats(Long providerId) {
        securityUtil.verifyProviderOwnershipOrAdmin(providerId);
        ProviderProfile profile = getProviderById(providerId);

        long totalBookings = bookingRepository.countByProviderId(providerId);
        long pendingBookings = bookingRepository.countByProviderIdAndStatus(providerId, BookingStatus.PENDING);
        long inProgressBookings = bookingRepository.countByProviderIdAndStatus(providerId, BookingStatus.IN_PROGRESS);
        long completedBookings = bookingRepository.countByProviderIdAndStatus(providerId, BookingStatus.COMPLETED);
        long cancelledBookings = bookingRepository.countByProviderIdAndStatus(providerId, BookingStatus.CANCELLED);

        double completionRate = 0.0;
        if (completedBookings + cancelledBookings > 0) {
            completionRate = Math.round(((double) completedBookings / (completedBookings + cancelledBookings)) * 1000.0) / 10.0;
        } else if (totalBookings > 0) {
            completionRate = Math.round(((double) completedBookings / totalBookings) * 1000.0) / 10.0;
        }

        return new ProviderStatsResponse(
                profile.getId(),
                totalBookings,
                completedBookings,
                pendingBookings,
                inProgressBookings,
                cancelledBookings,
                completionRate,
                profile.getRating(),
                profile.getReviewCount()
        );
    }
}
