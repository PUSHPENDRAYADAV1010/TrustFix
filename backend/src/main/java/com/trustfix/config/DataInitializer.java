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
        Category carpentry = initCategory("Carpentry", "Expert carpenters for door locks, hinges, modular furniture, and custom woodwork.", "🪚");

        // 2. Initialize Standard Service Catalog
        Service serviceElectrical = initService(electrical, "Electrical Repair & Inspection", "Complete inspection of switches, MCB trips, wiring issues, and sockets.", new BigDecimal("499.00"), 60, "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80");
        Service serviceWiring = initService(electrical, "Switchboard & Socket Installation", "Installation of modular switchboards, high-power appliance points, and MCBs.", new BigDecimal("349.00"), 45, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80");
        Service servicePlumbing = initService(plumbing, "Plumbing Repair & Leakage Fix", "Inspection and repair of leaking taps, pipe joints, flush valves, and drains.", new BigDecimal("399.00"), 45, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80");
        Service serviceBathroom = initService(plumbing, "Bathroom Fixture Installation", "Installation of showers, washbasins, mixer taps, and health faucets.", new BigDecimal("599.00"), 60, "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=500&auto=format&fit=crop&q=80");
        Service serviceDeepClean = initService(cleaning, "Full Home Deep Cleaning", "Intense scrubbing and sanitization of living areas, bedrooms, kitchen, and bathrooms.", new BigDecimal("1499.00"), 180, "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80");
        Service serviceKitchenClean = initService(cleaning, "Kitchen & Appliance Deep Clean", "Degreasing of gas stove, kitchen slabs, exhaust chimney, and cabinets.", new BigDecimal("899.00"), 120, "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&auto=format&fit=crop&q=80");
        Service serviceAcJet = initService(acRepair, "AC Deep Jet Servicing", "High-pressure jet pump cleaning of indoor cooling coils and outdoor unit.", new BigDecimal("599.00"), 45, "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80");
        Service serviceAcGas = initService(acRepair, "AC Cooling & Gas Refill", "Refrigerant leak test, vacuuming, and complete gas charging for split/window AC.", new BigDecimal("1899.00"), 60, "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80");
        Service serviceAppliance = initService(applianceRepair, "Washing Machine Diagnostic & Repair", "Motor inspection, drum rotation fix, water inlet valve and PCB troubleshooting.", new BigDecimal("499.00"), 60, "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80");
        Service serviceRefrigerator = initService(applianceRepair, "Refrigerator Diagnostic & Cooling Fix", "Thermostat check, gas charge, defrost timer and compressor diagnostic.", new BigDecimal("599.00"), 60, "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&auto=format&fit=crop&q=80");
        Service servicePainting = initService(painting, "Interior Wall Painting & Touch-up", "Premium emulsion wall painting with surface putty prep and roller finish.", new BigDecimal("1299.00"), 240, "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80");
        Service serviceCarpentry = initService(carpentry, "Door Lock, Hinge & Furniture Repair", "Repair and fitting of door locks, soft-close hinges, drawer channels, and wood fixtures.", new BigDecimal("399.00"), 60, "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&auto=format&fit=crop&q=80");

        // 3. Admin Account Initialization
        String effectiveAdminPass = adminPassword;
        if ((effectiveAdminPass == null || effectiveAdminPass.isBlank()) && !isProduction) {
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

        // 4. Seed Demo Customer & 12 Diverse Verified Service Providers
        if (seedDemoData && !isProduction) {
            seedDevelopmentAccounts(
                serviceElectrical, serviceWiring,
                servicePlumbing, serviceBathroom,
                serviceDeepClean, serviceKitchenClean,
                serviceAcJet, serviceAcGas,
                serviceAppliance, serviceRefrigerator,
                servicePainting, serviceCarpentry
            );
        }

        log.info("TrustFix initialization completed successfully.");
    }

    private void seedDevelopmentAccounts(
            Service serviceElectrical, Service serviceWiring,
            Service servicePlumbing, Service serviceBathroom,
            Service serviceDeepClean, Service serviceKitchenClean,
            Service serviceAcJet, Service serviceAcGas,
            Service serviceAppliance, Service serviceRefrigerator,
            Service servicePainting, Service serviceCarpentry) {

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

        // Primary Demo Provider
        initProviderWithServices(
            "Test Provider", "testprovider@gmail.com", "+919820100020", "Test@123",
            "Apex Home Care Specialist",
            "Certified master technician providing prompt electrical and appliance repairs with 7+ years of experience.",
            7, "Mumbai", "Maharashtra", "400053", 19.1136, 72.8697, 30.0, 4.90, 12, true,
            serviceElectrical, new BigDecimal("449.00"),
            serviceWiring, new BigDecimal("329.00")
        );

        // 1. Rajesh Kumar - Electrical
        initProviderWithServices(
            "Rajesh Kumar", "rajesh.kumar@trustfix.com", "+919820200001", "Test@123",
            "Kumar Electricals & Power Solutions",
            "Government-certified wireman with 8+ years of hands-on experience in residential and commercial electrical systems, heavy load balance, MCB panels, and short-circuit rectification.",
            8, "Thane", "Maharashtra", "400601", 19.2183, 72.9781, 30.0, 4.93, 148, true,
            serviceElectrical, new BigDecimal("349.00"),
            serviceWiring, new BigDecimal("299.00")
        );

        // 2. Vikram Jadhav - Plumbing
        initProviderWithServices(
            "Vikram Jadhav", "vikram.jadhav@trustfix.com", "+919820200002", "Test@123",
            "Jadhav Quick Plumbing & Sanitations",
            "Specialized in emergency plumbing, pipe burst control, bathroom mixer replacements, leak detection, and sanitaryware installations.",
            6, "Navi Mumbai", "Maharashtra", "400703", 19.0760, 72.8777, 25.0, 4.87, 92, true,
            servicePlumbing, new BigDecimal("349.00"),
            serviceBathroom, new BigDecimal("549.00")
        );

        // 3. Sunita Deshmukh - Cleaning
        initProviderWithServices(
            "Sunita Deshmukh", "sunita.deshmukh@trustfix.com", "+919820200003", "Test@123",
            "SparkleClean Deep Cleaning Services",
            "Head supervisor at SparkleClean. Professional single-disc scrubbing machines, HEPA vacuum systems, and eco-friendly disinfectants for sparkling clean homes.",
            7, "Mumbai", "Maharashtra", "400053", 19.1136, 72.8697, 35.0, 4.96, 230, true,
            serviceDeepClean, new BigDecimal("1399.00"),
            serviceKitchenClean, new BigDecimal("799.00")
        );

        // 4. Mohammad Farooqui - AC Repair
        initProviderWithServices(
            "Mohammad Farooqui", "mohammad.farooqui@trustfix.com", "+919820200004", "Test@123",
            "CoolAir AC Engineering & HVAC",
            "Daikin, Voltas & LG trained HVAC specialist. High-pressure foam jet cleaning, compressor diagnostics, cooling coil leak repair, and precision refrigerant charging.",
            10, "Mumbai", "Maharashtra", "400076", 19.1176, 72.9060, 30.0, 4.91, 310, true,
            serviceAcJet, new BigDecimal("549.00"),
            serviceAcGas, new BigDecimal("1799.00")
        );

        // 5. Ramesh Sharma - Appliance Repair
        initProviderWithServices(
            "Ramesh Sharma", "ramesh.sharma@trustfix.com", "+919820200005", "Test@123",
            "Sharma Appliance Tech Solutions",
            "Ex-Samsung authorized service technician. Expert in inverter refrigerators, front-load washing machines, microwave magnetrons, and water purifiers.",
            9, "Mumbai", "Maharashtra", "400092", 19.2288, 72.8541, 25.0, 4.84, 165, true,
            serviceAppliance, new BigDecimal("449.00"),
            serviceRefrigerator, new BigDecimal("549.00")
        );

        // 6. Amit Mistri - Carpentry
        initProviderWithServices(
            "Amit Mistri", "amit.mistri@trustfix.com", "+919820200006", "Test@123",
            "Mistri & Sons Fine Carpentry",
            "Heritage craftsmanship meets modern hardware. Fast repair of doors, locks, modular kitchen pull-out baskets, hinges, and custom plywood shelving.",
            12, "Mumbai", "Maharashtra", "400028", 19.0178, 72.8478, 25.0, 4.89, 110, true,
            serviceCarpentry, new BigDecimal("349.00"),
            null, null
        );

        // 7. Anand Verma - Painting
        initProviderWithServices(
            "Anand Verma", "anand.verma@trustfix.com", "+919820200007", "Test@123",
            "ColorCraft Express Painting",
            "Express interior painting contractor for apartments, offices, and rental touch-ups with moisture barrier treatment and roller finish.",
            5, "Mumbai", "Maharashtra", "400071", 19.0522, 72.8994, 30.0, 4.82, 140, true,
            servicePainting, new BigDecimal("1199.00"),
            null, null
        );

        // 8. Pooja Salvi - Cleaning & Sanitization
        initProviderWithServices(
            "Pooja Salvi", "pooja.salvi@trustfix.com", "+919820200008", "Test@123",
            "Elite Home Sanitization & Cleaners",
            "Specialized in bathroom hard-water descaling, kitchen chimney degreasing, sofa upholstery shampooing, and anti-bacterial fogging.",
            6, "Mumbai", "Maharashtra", "400063", 19.1663, 72.8526, 25.0, 4.94, 310, true,
            serviceDeepClean, new BigDecimal("1449.00"),
            serviceKitchenClean, new BigDecimal("849.00")
        );

        // 9. Sanjay Kulkarni - Electrical & Smart Home
        initProviderWithServices(
            "Sanjay Kulkarni", "sanjay.kulkarni@trustfix.com", "+919820200009", "Test@123",
            "Kulkarni Smart Home & Wiring",
            "Senior electrical specialist for inverter backup wiring, BLDC ceiling fan installations, 3-phase load balance, and heavy appliance cabling.",
            11, "Mumbai", "Maharashtra", "400025", 19.0144, 72.8277, 30.0, 4.90, 520, true,
            serviceElectrical, new BigDecimal("499.00"),
            serviceWiring, new BigDecimal("349.00")
        );

        // 10. Manoj Tiwari - HVAC & Climate
        initProviderWithServices(
            "Manoj Tiwari", "manoj.tiwari@trustfix.com", "+919820200011", "Test@123",
            "Tiwari HVAC Climate Solutions",
            "Certified refrigeration and AC technician. Specializing in split AC uninstallation/installation, inverter PCB repair, and cooling diagnostics.",
            8, "Thane", "Maharashtra", "400602", 19.2056, 72.9712, 30.0, 4.87, 410, true,
            serviceAcJet, new BigDecimal("599.00"),
            serviceAcGas, new BigDecimal("1849.00")
        );

        // 11. Ganesh Patil - Plumbing & Waterproofing
        initProviderWithServices(
            "Ganesh Patil", "ganesh.patil@trustfix.com", "+919820200012", "Test@123",
            "Patil Waterproofing & Plumbing Solutions",
            "Expert in concealed pipe leak detection using pressure testing, diverter valves, drain unclogging, and overhead water tank float valve repairs.",
            9, "Navi Mumbai", "Maharashtra", "400706", 19.0330, 73.0297, 35.0, 4.86, 340, true,
            servicePlumbing, new BigDecimal("399.00"),
            serviceBathroom, new BigDecimal("599.00")
        );

        // 12. Deepak Chauhan - Appliance Repairs
        initProviderWithServices(
            "Deepak Chauhan", "deepak.chauhan@trustfix.com", "+919820200013", "Test@123",
            "Chauhan Rapid Appliance Fix",
            "Prompt doorstep repair for semi-automatic & fully automatic washing machines, microwave heating issues, and refrigerator cooling coils.",
            7, "Mumbai", "Maharashtra", "400049", 19.1075, 72.8263, 25.0, 4.89, 275, true,
            serviceAppliance, new BigDecimal("479.00"),
            serviceRefrigerator, new BigDecimal("599.00")
        );
    }

    private void initProviderWithServices(
            String name, String email, String phone, String password,
            String businessName, String bio, int experienceYears,
            String city, String state, String postalCode,
            double latitude, double longitude, double serviceRadiusKm,
            double rating, int reviewCount, boolean available,
            Service s1, BigDecimal p1,
            Service s2, BigDecimal p2) {

        User providerUser = initUser(name, email, phone, password, UserRole.PROVIDER);
        ProviderProfile profile = providerProfileRepository.findByUserId(providerUser.getId()).orElseGet(() -> {
            ProviderProfile p = new ProviderProfile(providerUser, businessName, experienceYears);
            p.setBio(bio);
            p.setCity(city);
            p.setState(state);
            p.setPostalCode(postalCode);
            p.setLatitude(latitude);
            p.setLongitude(longitude);
            p.setServiceRadiusKm(serviceRadiusKm);
            p.setAvailable(available);
            p.setVerificationStatus(VerificationStatus.VERIFIED);
            p.setRating(rating);
            p.setReviewCount(reviewCount);
            return providerProfileRepository.save(p);
        });

        // Update profile in case fields changed
        profile.setBusinessName(businessName);
        profile.setBio(bio);
        profile.setExperienceYears(experienceYears);
        profile.setCity(city);
        profile.setState(state);
        profile.setPostalCode(postalCode);
        profile.setLatitude(latitude);
        profile.setLongitude(longitude);
        profile.setServiceRadiusKm(serviceRadiusKm);
        profile.setAvailable(available);
        profile.setVerificationStatus(VerificationStatus.VERIFIED);
        profile.setRating(rating);
        profile.setReviewCount(reviewCount);
        providerProfileRepository.save(profile);

        // Bind Services
        if (s1 != null && providerServiceRepository.findByProviderIdAndServiceId(profile.getId(), s1.getId()).isEmpty()) {
            ProviderService ps = new ProviderService(profile, s1, p1 != null ? p1 : s1.getBasePrice());
            ps.setAvailable(true);
            providerServiceRepository.save(ps);
        }
        if (s2 != null && providerServiceRepository.findByProviderIdAndServiceId(profile.getId(), s2.getId()).isEmpty()) {
            ProviderService ps = new ProviderService(profile, s2, p2 != null ? p2 : s2.getBasePrice());
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
