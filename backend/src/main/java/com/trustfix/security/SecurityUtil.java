package com.trustfix.security;

import com.trustfix.entity.Address;
import com.trustfix.entity.Booking;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.exception.ForbiddenException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@SuppressWarnings("null")
public class SecurityUtil {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public SecurityUtil(UserRepository userRepository, ProviderProfileRepository providerProfileRepository) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
    }

    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ForbiddenException("Authentication is required to access this resource");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user profile not found for: " + email));
    }

    public boolean isAdmin() {
        User user = getAuthenticatedUser();
        return user.getRole() == UserRole.ADMIN;
    }

    public void verifyUserOwnershipOrAdmin(Long targetUserId) {
        User authenticatedUser = getAuthenticatedUser();
        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return;
        }
        if (!authenticatedUser.getId().equals(targetUserId)) {
            throw new ForbiddenException("Unauthorized: You can only access or modify your own account resources");
        }
    }

    public void verifyProviderOwnershipOrAdmin(Long targetProviderId) {
        User authenticatedUser = getAuthenticatedUser();
        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return;
        }
        ProviderProfile provider = providerProfileRepository.findById(targetProviderId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with ID: " + targetProviderId));

        if (!provider.getUser().getId().equals(authenticatedUser.getId())) {
            throw new ForbiddenException("Unauthorized: You can only manage your own provider profile and services");
        }
    }

    public void verifyAddressOwnershipOrAdmin(Address address) {
        User authenticatedUser = getAuthenticatedUser();
        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return;
        }
        if (address.getUser() == null || !address.getUser().getId().equals(authenticatedUser.getId())) {
            throw new ForbiddenException("Unauthorized: You can only access or modify your own addresses");
        }
    }

    public void verifyBookingAccessOrAdmin(Booking booking) {
        User authenticatedUser = getAuthenticatedUser();
        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return;
        }
        boolean isCustomer = booking.getCustomer() != null && booking.getCustomer().getId().equals(authenticatedUser.getId());
        boolean isProviderOwner = booking.getProvider() != null && booking.getProvider().getUser() != null && booking.getProvider().getUser().getId().equals(authenticatedUser.getId());

        if (!isCustomer && !isProviderOwner) {
            throw new ForbiddenException("Unauthorized: You do not have permission to view or modify this booking");
        }
    }
}
