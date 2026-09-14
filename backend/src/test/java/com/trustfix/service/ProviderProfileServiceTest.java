package com.trustfix.service;

import com.trustfix.dto.mapper.ProviderProfileMapper;
import com.trustfix.dto.provider.ProviderLocationResponse;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class ProviderProfileServiceTest {

    @Mock
    private ProviderProfileRepository providerProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private ProviderProfileMapper providerProfileMapper = new ProviderProfileMapper();

    @InjectMocks
    private ProviderProfileService providerProfileService;

    private ProviderProfile sampleProfile;

    @BeforeEach
    void setUp() {
        User user = new User("Provider Bob", "bob@example.com", "password123", "9999988888", UserRole.PROVIDER);
        user.setId(2L);

        sampleProfile = new ProviderProfile(user, "Bob Plumbing", 5);
        sampleProfile.setId(1L);
        sampleProfile.setVerificationStatus(VerificationStatus.VERIFIED);
        sampleProfile.setAvailable(true);
        sampleProfile.setLatitude(19.2183);
        sampleProfile.setLongitude(72.9781);
        sampleProfile.setServiceRadiusKm(25.0);
    }

    @Test
    void findNearbyProviders_WithinRadius_ReturnsProvider() {
        when(providerProfileRepository.findByVerificationStatusAndAvailableTrue(VerificationStatus.VERIFIED))
                .thenReturn(List.of(sampleProfile));

        // Customer in Mumbai (approx 18km from Thane)
        List<ProviderLocationResponse> nearby = providerProfileService.findNearbyProviders(19.0760, 72.8777, 25.0, null);

        assertNotNull(nearby);
        assertEquals(1, nearby.size());
        assertEquals("Bob Plumbing", nearby.get(0).getBusinessName());
    }

    @Test
    void findNearbyProviders_OutsideRadius_ReturnsEmptyList() {
        when(providerProfileRepository.findByVerificationStatusAndAvailableTrue(VerificationStatus.VERIFIED))
                .thenReturn(List.of(sampleProfile));

        // Customer far away (Delhi: 28.6139, 77.2090)
        List<ProviderLocationResponse> nearby = providerProfileService.findNearbyProviders(28.6139, 77.2090, 25.0, null);

        assertNotNull(nearby);
        assertFalse(nearby.iterator().hasNext());
    }
}
