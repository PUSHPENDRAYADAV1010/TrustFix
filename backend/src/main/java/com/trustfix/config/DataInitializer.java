package com.trustfix.config;

import com.trustfix.entity.Address;
import com.trustfix.entity.Category;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.ProviderService;
import com.trustfix.entity.Service;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.repository.AddressRepository;
import com.trustfix.repository.CategoryRepository;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.ProviderServiceRepository;
import com.trustfix.repository.ServiceRepository;
import com.trustfix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final AddressRepository addressRepository;
    private final ProviderServiceRepository providerServiceRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:${ADMIN_EMAIL:admin@trustfix.com}}")
    private String adminEmail;

    @Value("${admin.password:${ADMIN_PASSWORD:}}")
    private String adminPassword;

    @Value("${app.seed-demo-data:${APP_SEED_DEMO_DATA:true}}")
    private boolean seedDemoData;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ServiceRepository serviceRepository,
                           ProviderProfileRepository providerProfileRepository,
                           AddressRepository addressRepository,
                           ProviderServiceRepository providerServiceRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.serviceRepository = serviceRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.addressRepository = addressRepository;
        this.providerServiceRepository = providerServiceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        boolean isProduction = "prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile);
        log.info("Checking and initializing TrustFix service catalog & security seed data (profile={}, seedDemoData={})...", activeProfile, seedDemoData);

        // 1. Initialize Standard Category Catalog
        Category electrical = initCategory("Electrical", "Certified electricians for wiring, fixtures, switchboards, and electrical repairs.", "⚡");
        Category plumbing = initCategory("Plumbing", "Expert plumbers for tap leaks, bathroom fixtures, drain cleaning & piping.", "🚰");
        Category cleaning = initCategory("Cleaning", "Professional home deep cleaning, kitchen sanitization & bathroom scrubbing.", "✨");
        Category acRepair = initCategory("AC Repair", "AC servicing, deep jet cleaning, cooling troubleshooting, and gas refill.", "❄️");
        Category applianceRepair = initCategory("Appliance Repair", "Skilled technicians for washing machines, refrigerators, and microwaves.", "🛠️");
        Category painting = initCategory("Painting", "Interior & exterior house painting, wall waterproofing, and color consultation.", "🎨");

        // 2. Initialize Standard Service Catalog
        Service serviceElectrical = initService(electrical, "Electrical Repair & Inspection", "Complete inspection of switches, MCB trips, wiring issues, and sockets.", new BigDecimal("499.00"), 60, "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80");
        initService(electrical, "Switchboard & Socket Installation", "Installation of modular switchboards, high-power appliance points, and MCBs.", new BigDecimal("349.00"), 45, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80");
        initService(plumbing, "Plumbing Repair & Leakage Fix", "Inspection and repair of leaking taps, pipe joints, flush valves, and drains.", new BigDecimal("399.00"), 45, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80");
        initService(plumbing, "Bathroom Fixture Installation", "Installation of showers, washbasins, mixer taps, and health faucets.", new BigDecimal("599.00"), 60, "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=500&auto=format&fit=crop&q=80");
        initService(cleaning, "Full Home Deep Cleaning", "Intense scrubbing and sanitization of living areas, bedrooms, kitchen, and bathrooms.", new BigDecimal("1499.00"), 180, "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80");
        initService(cleaning, "Kitchen & Appliance Deep Clean", "Degreasing of gas stove, kitchen slabs, exhaust chimney, and cabinets.", new BigDecimal("899.00"), 120, "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&auto=format&fit=crop&q=80");
        initService(acRepair, "AC Deep Jet Servicing", "High-pressure jet pump cleaning of indoor cooling coils and outdoor unit.", new BigDecimal("599.00"), 45, "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80");
        initService(acRepair, "AC Cooling & Gas Refill", "Refrigerant leak test, vacuuming, and complete gas charging for split/window AC.", new BigDecimal("1899.00"), 60, "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80");
        initService(applianceRepair, "Washing Machine Diagnostic & Repair", "Motor inspection, drum rotation fix, water inlet valve and PCB troubleshooting.", new BigDecimal("499.00"), 60, "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80");
        initService(painting, "Interior Wall Painting & Touch-up", "Premium emulsion wall painting with surface putty prep and roller finish.", new BigDecimal("1299.00"), 240, "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80");

        // 3. Admin Account Initialization
        String effectiveAdminPass = adminPassword;
        if ((effectiveAdminPass == null || effectiveAdminPass.isBlank()) && !isProduction) {
            // Safe non-production development fallback matching E2E verification suites
            effectiveAdminPass = "Admin@123";
        }

        if (effectiveAdminPass != null && !effectiveAdminPass.isBlank()) {
            initUser("TrustFix Admin", adminEmail, "+919820100001", effectiveAdminPass, UserRole.ADMIN);
            log.info("TrustFix Admin account ensured: {}", adminEmail);
            if (!"admin@trustfix.com".equalsIgnoreCase(adminEmail) && !isProduction) {
                initUser("TrustFix System Admin", "admin@trustfix.com", "+919820100002", "Admin@123", UserRole.ADMIN);
                log.info("Standard test admin ensured: admin@trustfix.com");
            }
        } else {
            log.warn("No ADMIN_PASSWORD configured in production profile. Skipping automatic admin provisioning.");
        }

        // 4. Seed Demo & E2E Accounts (Development/Testing Only)
        if (seedDemoData && !isProduction) {
            seedDevelopmentAccounts(serviceElectrical);
        }

        log.info("TrustFix initialization completed successfully.");
    }

    private void seedDevelopmentAccounts(Service serviceElectrical) {
        // Seed Customer Account
        User customer = initUser("Test Customer", "testcustomer@gmail.com", "+919820100010", "Test@123", UserRole.CUSTOMER);
        if (addressRepository.findByUserId(customer.getId()).isEmpty()) {
            Address address = new Address(customer, "Flat 101, Palm Grove", "Mumbai", "Maharashtra", "400053");
            address.setAddressLine2("Andheri West");
            address.setLandmark("Near Metro Station");
            address.setLatitude(19.1136);
            address.setLongitude(72.8697);
            address.setDefaultAddress(true);
            addressRepository.save(address);
        }

        // Seed Verified Provider Account
        User providerUser = initUser("Test Provider", "testprovider@gmail.com", "+919820100020", "Test@123", UserRole.PROVIDER);
        ProviderProfile profile = providerProfileRepository.findByUserId(providerUser.getId()).orElseGet(() -> {
            ProviderProfile p = new ProviderProfile(providerUser, "Apex Home Care Specialist", 7);
            p.setBio("Certified master technician providing prompt home repairs with 7+ years of experience.");
            p.setCity("Mumbai");
            p.setState("Maharashtra");
            p.setPostalCode("400053");
            p.setLatitude(19.1136);
            p.setLongitude(72.8697);
            p.setServiceRadiusKm(30.0);
            p.setAvailable(true);
            p.setVerificationStatus(VerificationStatus.VERIFIED);
            p.setRating(4.9);
            p.setReviewCount(12);
            return providerProfileRepository.save(p);
        });

        // Ensure provider offers at least one service
        if (serviceElectrical != null && providerServiceRepository.findByProviderId(profile.getId()).isEmpty()) {
            ProviderService ps = new ProviderService(profile, serviceElectrical, new BigDecimal("449.00"));
            ps.setAvailable(true);
            providerServiceRepository.save(ps);
        }
    }

    private User initUser(String name, String email, String phone, String password, UserRole role) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User u = existing.get();
            u.setName(name);
            u.setPhone(phone);
            u.setPassword(passwordEncoder.encode(password));
            u.setActive(true);
            u.setRole(role);
            return userRepository.save(u);
        }
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPhone(phone);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole(role);
        u.setActive(true);
        return userRepository.save(u);
    }

    private Category initCategory(String name, String description, String iconUrl) {
        Optional<Category> existing = categoryRepository.findByName(name);
        if (existing.isPresent()) {
            Category c = existing.get();
            c.setDescription(description);
            c.setIconUrl(iconUrl);
            c.setActive(true);
            return categoryRepository.save(c);
        }
        Category c = new Category();
        c.setName(name);
        c.setDescription(description);
        c.setIconUrl(iconUrl);
        c.setActive(true);
        return categoryRepository.save(c);
    }

    private Service initService(Category category, String name, String description, BigDecimal basePrice, Integer durationMinutes, String imageUrl) {
        Optional<Service> existing = serviceRepository.findAll().stream().filter(s -> s.getName().equalsIgnoreCase(name)).findFirst();
        if (existing.isPresent()) {
            Service s = existing.get();
            s.setCategory(category);
            s.setDescription(description);
            s.setBasePrice(basePrice);
            s.setDurationInMinutes(durationMinutes);
            s.setImageUrl(imageUrl);
            s.setActive(true);
            return serviceRepository.save(s);
        }
        Service s = new Service();
        s.setCategory(category);
        s.setName(name);
        s.setDescription(description);
        s.setBasePrice(basePrice);
        s.setDurationInMinutes(durationMinutes);
        s.setImageUrl(imageUrl);
        s.setActive(true);
        return serviceRepository.save(s);
    }
}
