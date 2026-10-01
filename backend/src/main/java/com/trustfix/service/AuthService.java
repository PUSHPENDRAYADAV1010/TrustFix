package com.trustfix.service;

import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.exception.BadRequestException;
import com.trustfix.repository.UserRepository;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User register(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException(
                    "User with email '" + user.getEmail() + "' already exists"
            );
        }

        if (user.getPhone() != null
                && !user.getPhone().isBlank()
                && userRepository.existsByPhone(user.getPhone())) {
            throw new BadRequestException(
                    "User with phone number '" + user.getPhone() + "' already exists"
            );
        }

        if (user.getRole() == null) {
            user.setRole(UserRole.CUSTOMER);
        }

        // Validate strong password policy before encoding
        com.trustfix.util.PasswordValidator.validate(user.getPassword());

        // Password is stored as BCrypt hash
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);

        // A provider account must always have a ProviderProfile.
        // Without this record the provider can log in, but the dashboard,
        // admin verification and customer provider directory cannot resolve
        // the provider's profile.
        if (savedUser.getRole() == UserRole.PROVIDER
                && providerProfileRepository.findByUserId(savedUser.getId()).isEmpty()) {
            ProviderProfile profile = new ProviderProfile();
            profile.setUser(savedUser);
            profile.setBusinessName(savedUser.getName());
            profile.setExperienceYears(0);
            profile.setVerificationStatus(
                    VerificationStatus.PENDING
            );
            profile.setAvailable(false);
            profile.setServiceRadiusKm(25.0);
            profile.setRating(0.0);
            profile.setReviewCount(0);
            providerProfileRepository.save(profile);
        }

        return savedUser;
    }

    @Transactional(readOnly = true)
    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadRequestException("Invalid email or password"));

        if (!user.isActive()) {
            throw new BadRequestException("User account is inactive");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return jwtService.generateToken(user);
    }
}