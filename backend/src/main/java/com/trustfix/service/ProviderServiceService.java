package com.trustfix.service;

import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.ProviderService;
import com.trustfix.entity.Service;
import com.trustfix.exception.ResourceAlreadyExistsException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.ProviderServiceRepository;
import com.trustfix.repository.ServiceRepository;
import com.trustfix.security.SecurityUtil;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@org.springframework.stereotype.Service
@Transactional
@SuppressWarnings("null")
public class ProviderServiceService {

    private final ProviderServiceRepository providerServiceRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceRepository serviceRepository;
    private final SecurityUtil securityUtil;

    public ProviderServiceService(ProviderServiceRepository providerServiceRepository,
                                  ProviderProfileRepository providerProfileRepository,
                                  ServiceRepository serviceRepository,
                                  SecurityUtil securityUtil) {
        this.providerServiceRepository = providerServiceRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.serviceRepository = serviceRepository;
        this.securityUtil = securityUtil;
    }

    public ProviderService addServiceToProvider(Long providerId, Long serviceId, BigDecimal customPrice) {
        securityUtil.verifyProviderOwnershipOrAdmin(providerId);

        ProviderProfile provider = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with ID: " + providerId));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + serviceId));

        if (providerServiceRepository.existsByProviderIdAndServiceId(providerId, serviceId)) {
            throw new ResourceAlreadyExistsException("Provider already offers service ID: " + serviceId);
        }

        ProviderService providerService = new ProviderService(provider, service, customPrice != null ? customPrice : service.getBasePrice());
        return providerServiceRepository.save(providerService);
    }

    @Transactional(readOnly = true)
    public List<ProviderService> getServicesForProvider(Long providerId) {
        if (!providerProfileRepository.existsById(providerId)) {
            throw new ResourceNotFoundException("Provider profile not found with ID: " + providerId);
        }
        return providerServiceRepository.findByProviderId(providerId);
    }

    @Transactional(readOnly = true)
    public List<ProviderService> getProvidersForService(Long serviceId) {
        if (!serviceRepository.existsById(serviceId)) {
            throw new ResourceNotFoundException("Service not found with ID: " + serviceId);
        }
        return providerServiceRepository.findByServiceId(serviceId);
    }

    public ProviderService updateCustomPrice(Long providerId, Long serviceId, BigDecimal customPrice) {
        securityUtil.verifyProviderOwnershipOrAdmin(providerId);

        ProviderService providerService = providerServiceRepository.findByProviderIdAndServiceId(providerId, serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("ProviderService mapping not found for provider ID: " + providerId + " and service ID: " + serviceId));

        providerService.setCustomPrice(customPrice);
        return providerServiceRepository.save(providerService);
    }

    public void removeServiceFromProvider(Long providerId, Long serviceId) {
        securityUtil.verifyProviderOwnershipOrAdmin(providerId);

        ProviderService providerService = providerServiceRepository.findByProviderIdAndServiceId(providerId, serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("ProviderService mapping not found for provider ID: " + providerId + " and service ID: " + serviceId));

        providerServiceRepository.delete(providerService);
    }
}
