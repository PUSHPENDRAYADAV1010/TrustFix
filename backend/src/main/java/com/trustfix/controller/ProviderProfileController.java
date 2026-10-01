package com.trustfix.controller;

import com.trustfix.dto.mapper.ProviderProfileMapper;
import com.trustfix.dto.provider.ProviderLocationResponse;
import com.trustfix.dto.provider.ProviderProfileRequest;
import com.trustfix.dto.provider.ProviderProfileResponse;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.service.ProviderProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class ProviderProfileController {

    private final ProviderProfileService providerProfileService;
    private final ProviderProfileMapper providerProfileMapper;

    public ProviderProfileController(ProviderProfileService providerProfileService, ProviderProfileMapper providerProfileMapper) {
        this.providerProfileService = providerProfileService;
        this.providerProfileMapper = providerProfileMapper;
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<ProviderProfileResponse> createProviderProfile(
            @PathVariable Long userId,
            @Valid @RequestBody ProviderProfileRequest request) {
        ProviderProfile profile = providerProfileMapper.toEntity(request);
        ProviderProfile createdProfile = providerProfileService.createProviderProfile(userId, profile);
        return new ResponseEntity<>(providerProfileMapper.toResponse(createdProfile), HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<ProviderProfileResponse> createProviderProfileWithQueryParam(
            @RequestParam(required = false) Long userId,
            @Valid @RequestBody ProviderProfileRequest request) {
        Long targetUserId = userId != null ? userId : (request != null ? request.getUserId() : null);
        if (targetUserId == null) {
            throw new com.trustfix.exception.BadRequestException("User ID is required to create a provider profile");
        }
        ProviderProfile profile = providerProfileMapper.toEntity(request);
        ProviderProfile createdProfile = providerProfileService.createProviderProfile(targetUserId, profile);
        return new ResponseEntity<>(providerProfileMapper.toResponse(createdProfile), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderProfileResponse> getProviderById(@PathVariable Long id) {
        ProviderProfile profile = providerProfileService.getProviderById(id);
        return ResponseEntity.ok(providerProfileMapper.toResponse(profile));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ProviderProfileResponse> getProviderByUserId(@PathVariable Long userId) {
        ProviderProfile profile = providerProfileService.getProviderByUserId(userId);
        return ResponseEntity.ok(providerProfileMapper.toResponse(profile));
    }

    @GetMapping("/verified")
    public ResponseEntity<List<ProviderProfileResponse>> getVerifiedProviders() {
        List<ProviderProfileResponse> providers = providerProfileService.getVerifiedProviders()
                .stream()
                .map(providerProfileMapper::toResponse)
                .toList();
        return ResponseEntity.ok(providers);
    }

    @GetMapping("/available")
    public ResponseEntity<List<ProviderProfileResponse>> getAvailableVerifiedProviders() {
        List<ProviderProfileResponse> providers = providerProfileService.getAvailableVerifiedProviders()
                .stream()
                .map(providerProfileMapper::toResponse)
                .toList();
        return ResponseEntity.ok(providers);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<ProviderLocationResponse>> getNearbyProviders(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false, defaultValue = "25.0") Double radiusKm,
            @RequestParam(required = false) Long serviceId) {
        List<ProviderLocationResponse> nearbyProviders = providerProfileService.findNearbyProviders(lat, lng, radiusKm, serviceId);
        return ResponseEntity.ok(nearbyProviders);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProviderProfileResponse> updateProviderProfile(
            @PathVariable Long id,
            @Valid @RequestBody ProviderProfileRequest request) {
        ProviderProfile updatedDetails = providerProfileMapper.toEntity(request);
        ProviderProfile profile = providerProfileService.updateProviderProfile(id, updatedDetails);
        return ResponseEntity.ok(providerProfileMapper.toResponse(profile));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ProviderProfileResponse> updateVerificationStatus(
            @PathVariable Long id,
            @RequestParam VerificationStatus status) {
        ProviderProfile profile = providerProfileService.updateVerificationStatus(id, status);
        return ResponseEntity.ok(providerProfileMapper.toResponse(profile));
    }
}
