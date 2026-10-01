package com.trustfix.repository;

import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.User;
import com.trustfix.entity.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {

    Optional<ProviderProfile> findByUser(User user);

    Optional<ProviderProfile> findByUserId(Long userId);

    List<ProviderProfile> findByVerificationStatus(VerificationStatus status);

    List<ProviderProfile> findByAvailableTrue();

    List<ProviderProfile> findByVerificationStatusAndAvailableTrue(VerificationStatus status);

    long countByVerificationStatus(VerificationStatus status);

    @Query("SELECT DISTINCT ps.provider FROM ProviderService ps WHERE ps.provider.verificationStatus = :status AND ps.provider.available = true AND ps.service.id = :serviceId AND ps.available = true")
    List<ProviderProfile> findAvailableVerifiedProvidersByServiceId(@Param("status") VerificationStatus status, @Param("serviceId") Long serviceId);

    @Query("SELECT p FROM ProviderProfile p WHERE " +
           "(:status IS NULL OR p.verificationStatus = :status) AND " +
           "(:search IS NULL OR LOWER(p.businessName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.user.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.user.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ProviderProfile> findProvidersFiltered(
            @Param("status") VerificationStatus status,
            @Param("search") String search,
            Pageable pageable);
}
