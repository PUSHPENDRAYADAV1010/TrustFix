package com.trustfix.repository;

import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.ProviderService;
import com.trustfix.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderServiceRepository extends JpaRepository<ProviderService, Long> {

    List<ProviderService> findByProvider(ProviderProfile provider);

    List<ProviderService> findByProviderId(Long providerId);

    List<ProviderService> findByProviderIdAndAvailableTrue(Long providerId);

    long countByProviderIdAndAvailableTrue(Long providerId);

    List<ProviderService> findByService(Service service);

    List<ProviderService> findByServiceId(Long serviceId);

    Optional<ProviderService> findByProviderAndService(ProviderProfile provider, Service service);

    Optional<ProviderService> findByProviderIdAndServiceId(Long providerId, Long serviceId);

    boolean existsByProviderIdAndServiceId(Long providerId, Long serviceId);
}
