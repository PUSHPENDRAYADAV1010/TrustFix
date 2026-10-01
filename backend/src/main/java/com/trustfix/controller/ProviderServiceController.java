package com.trustfix.controller;

import com.trustfix.dto.mapper.ProviderServiceMapper;
import com.trustfix.dto.providerservice.ProviderServiceResponse;
import com.trustfix.entity.ProviderService;
import com.trustfix.service.ProviderServiceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/provider-services")
public class ProviderServiceController {

    private final ProviderServiceService providerServiceService;
    private final ProviderServiceMapper providerServiceMapper;

    public ProviderServiceController(ProviderServiceService providerServiceService, ProviderServiceMapper providerServiceMapper) {
        this.providerServiceService = providerServiceService;
        this.providerServiceMapper = providerServiceMapper;
    }

    @PostMapping("/provider/{providerId}/service/{serviceId}")
    public ResponseEntity<ProviderServiceResponse> addServiceToProvider(
            @PathVariable Long providerId,
            @PathVariable Long serviceId,
            @RequestParam(required = false) BigDecimal customPrice) {
        ProviderService createdProviderService = providerServiceService.addServiceToProvider(providerId, serviceId, customPrice);
        return new ResponseEntity<>(providerServiceMapper.toResponse(createdProviderService), HttpStatus.CREATED);
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ProviderServiceResponse>> getServicesForProvider(@PathVariable Long providerId) {
        List<ProviderServiceResponse> services = providerServiceService.getServicesForProvider(providerId)
                .stream()
                .map(providerServiceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<ProviderServiceResponse>> getProvidersForService(@PathVariable Long serviceId) {
        List<ProviderServiceResponse> providers = providerServiceService.getProvidersForService(serviceId)
                .stream()
                .map(providerServiceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(providers);
    }

    @PutMapping("/provider/{providerId}/service/{serviceId}/price")
    public ResponseEntity<ProviderServiceResponse> updateCustomPrice(
            @PathVariable Long providerId,
            @PathVariable Long serviceId,
            @RequestParam BigDecimal customPrice) {
        ProviderService updatedProviderService = providerServiceService.updateCustomPrice(providerId, serviceId, customPrice);
        return ResponseEntity.ok(providerServiceMapper.toResponse(updatedProviderService));
    }

    @PutMapping("/provider/{providerId}/service/{serviceId}/status")
    public ResponseEntity<ProviderServiceResponse> updateServiceAvailability(
            @PathVariable Long providerId,
            @PathVariable Long serviceId,
            @RequestParam boolean available) {
        ProviderService updatedProviderService = providerServiceService.updateServiceAvailability(providerId, serviceId, available);
        return ResponseEntity.ok(providerServiceMapper.toResponse(updatedProviderService));
    }

    @DeleteMapping("/provider/{providerId}/service/{serviceId}")
    public ResponseEntity<Void> removeServiceFromProvider(
            @PathVariable Long providerId,
            @PathVariable Long serviceId) {
        providerServiceService.removeServiceFromProvider(providerId, serviceId);
        return ResponseEntity.noContent().build();
    }
}
