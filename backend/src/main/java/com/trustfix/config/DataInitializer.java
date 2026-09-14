package com.trustfix.config;

import com.trustfix.entity.Address;
import com.trustfix.entity.Booking;
import com.trustfix.entity.BookingStatus;
import com.trustfix.entity.Category;
import com.trustfix.entity.ProviderProfile;
import com.trustfix.entity.ProviderService;
import com.trustfix.entity.Review;
import com.trustfix.entity.Service;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.repository.AddressRepository;
import com.trustfix.repository.BookingRepository;
import com.trustfix.repository.CategoryRepository;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.ProviderServiceRepository;
import com.trustfix.repository.ReviewRepository;
import com.trustfix.repository.ServiceRepository;
import com.trustfix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final CategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;
    private final ProviderServiceRepository providerServiceRepository;
    private final AddressRepository addressRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ProviderProfileRepository providerProfileRepository,
                           CategoryRepository categoryRepository,
                           ServiceRepository serviceRepository,
                           ProviderServiceRepository providerServiceRepository,
                           AddressRepository addressRepository,
                           BookingRepository bookingRepository,
                           ReviewRepository reviewRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.categoryRepository = categoryRepository;
        this.serviceRepository = serviceRepository;
        this.providerServiceRepository = providerServiceRepository;
        this.addressRepository = addressRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and initializing TrustFix production/demo seed data...");

        // 1. Initialize Admin Account with standard and custom fallback
        String customAdminEmail = System.getenv("ADMIN_EMAIL");
        String adminPassword = System.getenv("ADMIN_PASSWORD");
        if (adminPassword == null || adminPassword.isBlank()) {
            adminPassword = "Admin@123";
        }

        initUser("TrustFix Admin", "admin@trustfix.com", "+919820100001", adminPassword, UserRole.ADMIN);
        if (customAdminEmail != null && !customAdminEmail.isBlank() && !customAdminEmail.equalsIgnoreCase("admin@trustfix.com")) {
            initUser("Pushpendra Yadav (Admin)", customAdminEmail, "+919820100099", adminPassword, UserRole.ADMIN);
        }  

        // 2. Initialize Categories & Services
        Category electrical = initCategory("Electrical", "Certified electricians for wiring, fixtures, switchboards, and electrical repairs.", "⚡");
        Category plumbing = initCategory("Plumbing", "Expert plumbers for tap leaks, bathroom fixtures, drain cleaning & piping.", "🚰");
        Category cleaning = initCategory("Cleaning", "Professional home deep cleaning, kitchen sanitization & bathroom scrubbing.", "✨");
        Category acRepair = initCategory("AC Repair", "AC servicing, deep jet cleaning, cooling troubleshooting, and gas refill.", "❄️");
        Category applianceRepair = initCategory("Appliance Repair", "Skilled technicians for washing machines, refrigerators, and microwaves.", "🛠️");
        Category painting = initCategory("Painting", "Interior & exterior house painting, wall waterproofing, and color consultation.", "🎨");

        Service sElec1 = initService(electrical, "Electrical Repair & Inspection", "Complete inspection of switches, MCB trips, wiring issues, and sockets.", new BigDecimal("499.00"), 60, "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80");
        Service sElec2 = initService(electrical, "Switchboard & Socket Installation", "Installation of modular switchboards, high-power appliance points, and MCBs.", new BigDecimal("349.00"), 45, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80");
        Service sPlumb1 = initService(plumbing, "Plumbing Repair & Leakage Fix", "Inspection and repair of leaking taps, pipe joints, flush valves, and drains.", new BigDecimal("399.00"), 45, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80");
        Service sPlumb2 = initService(plumbing, "Bathroom Fixture Installation", "Installation of showers, washbasins, mixer taps, and health faucets.", new BigDecimal("599.00"), 60, "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=500&auto=format&fit=crop&q=80");
        Service sClean1 = initService(cleaning, "Full Home Deep Cleaning", "Intense scrubbing and sanitization of living areas, bedrooms, kitchen, and bathrooms.", new BigDecimal("1499.00"), 180, "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80");
        Service sClean2 = initService(cleaning, "Kitchen & Appliance Deep Clean", "Degreasing of gas stove, kitchen slabs, exhaust chimney, and cabinets.", new BigDecimal("899.00"), 120, "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&auto=format&fit=crop&q=80");
        Service sAc1 = initService(acRepair, "AC Deep Jet Servicing", "High-pressure jet pump cleaning of indoor cooling coils and outdoor unit.", new BigDecimal("599.00"), 45, "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80");
        Service sAc2 = initService(acRepair, "AC Cooling & Gas Refill", "Refrigerant leak test, vacuuming, and complete gas charging for split/window AC.", new BigDecimal("1899.00"), 60, "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80");
        Service sApp1 = initService(applianceRepair, "Washing Machine Diagnostic & Repair", "Motor inspection, drum rotation fix, water inlet valve and PCB troubleshooting.", new BigDecimal("499.00"), 60, "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80");
        Service sPaint1 = initService(painting, "Interior Wall Painting & Touch-up", "Premium emulsion wall painting with surface putty prep and roller finish.", new BigDecimal("1299.00"), 240, "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80");

        // 3. Initialize Customer Account & Address
        User customer = initUser("Test Customer", "testcustomer@gmail.com", "+919820111111", "Test@123", UserRole.CUSTOMER);
        Address custAddr = initAddress(customer, "101, Palm Beach Residency", "Sector 15, Vashi", "Navi Mumbai", "Maharashtra", "400703", "Near Bus Depot", 19.0760, 72.9986, true);

        // 4. Initialize Verified Providers
        User uProv1 = initUser("Rajesh Kumar", "testprovider@gmail.com", "+919820122222", "Test@123", UserRole.PROVIDER);
        ProviderProfile p1 = initProviderProfile(uProv1, "Rajesh Electricals & Home Repair Specialist", "Govt licensed electrician with 8+ years experience in domestic & commercial wirings.", 8, VerificationStatus.VERIFIED, "Mumbai", "Maharashtra", "400053", 19.1136, 72.8697, 25.0, 4.9, 18, true);
        initProviderService(p1, sElec1, new BigDecimal("499.00"));
        initProviderService(p1, sElec2, new BigDecimal("349.00"));

        User uProv2 = initUser("Priya Sharma", "priya.plumber@trustfix.com", "+919820133333", "Test@123", UserRole.PROVIDER);
        ProviderProfile p2 = initProviderProfile(uProv2, "Priya Plumbing & Sanitary Solutions", "Certified master plumber specializing in bathroom fixture upgrades and leak detection.", 6, VerificationStatus.VERIFIED, "Thane", "Maharashtra", "400601", 19.2183, 72.9781, 20.0, 4.8, 24, true);
        initProviderService(p2, sPlumb1, new BigDecimal("399.00"));
        initProviderService(p2, sPlumb2, new BigDecimal("599.00"));

        User uProv3 = initUser("Amit Verma", "amit.ac@trustfix.com", "+919820144444", "Test@123", UserRole.PROVIDER);
        ProviderProfile p3 = initProviderProfile(uProv3, "Amit AC & Cooling Center", "HVAC certified technician for precision AC diagnostics, jet cleaning, and gas top-up.", 9, VerificationStatus.VERIFIED, "Navi Mumbai", "Maharashtra", "400703", 19.0330, 73.0297, 30.0, 4.9, 32, true);
        initProviderService(p3, sAc1, new BigDecimal("599.00"));
        initProviderService(p3, sAc2, new BigDecimal("1899.00"));

        User uProv4 = initUser("Vikram Singh", "vikram.clean@trustfix.com", "+919820155555", "Test@123", UserRole.PROVIDER);
        ProviderProfile p4 = initProviderProfile(uProv4, "Vikram Deep Cleaning & Sanitization", "Eco-friendly full home scrubbing, tile degreasing, and chemical sanitization specialist.", 7, VerificationStatus.VERIFIED, "Mumbai", "Maharashtra", "400050", 19.0760, 72.8777, 25.0, 4.8, 15, true);
        initProviderService(p4, sClean1, new BigDecimal("1499.00"));
        initProviderService(p4, sClean2, new BigDecimal("899.00"));

        // 5. Initialize Sample Booking & Review if none exists
        if (bookingRepository.count() == 0) {
            Booking sampleBooking = new Booking();
            sampleBooking.setBookingReference("TF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            sampleBooking.setCustomer(customer);
            sampleBooking.setProvider(p1);
            sampleBooking.setService(sElec1);
            sampleBooking.setAddress(custAddr);
            sampleBooking.setBookingDate(LocalDate.now().plusDays(1));
            sampleBooking.setBookingTime(LocalTime.of(11, 0));
            sampleBooking.setStatus(BookingStatus.CONFIRMED);
            sampleBooking.setTotalAmount(new BigDecimal("499.00"));
            sampleBooking.setNotes("Main switch fuse box inspection and fan regulator replacement.");
            bookingRepository.save(sampleBooking);
            log.info("Initialized sample confirmed booking {}", sampleBooking.getBookingReference());
        }

        log.info("TrustFix seed initialization completed successfully.");
    }

    private User initUser(String name, String email, String phone, String password, UserRole role) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User u = existing.get();
            // Ensure password and role are up to date
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

    private Address initAddress(User user, String line1, String line2, String city, String state, String postalCode, String landmark, Double lat, Double lng, boolean isDefault) {
        Optional<Address> existing = addressRepository.findByUserId(user.getId()).stream().findFirst();
        if (existing.isPresent()) {
            return existing.get();
        }
        Address a = new Address();
        a.setUser(user);
        a.setAddressLine1(line1);
        a.setAddressLine2(line2);
        a.setCity(city);
        a.setState(state);
        a.setPostalCode(postalCode);
        a.setLandmark(landmark);
        a.setCountry("India");
        a.setLatitude(lat);
        a.setLongitude(lng);
        a.setDefaultAddress(isDefault);
        return addressRepository.save(a);
    }

    private ProviderProfile initProviderProfile(User user, String businessName, String bio, Integer exp, VerificationStatus status, String city, String state, String postalCode, Double lat, Double lng, Double radiusKm, Double rating, Integer reviewCount, boolean available) {
        Optional<ProviderProfile> existing = providerProfileRepository.findByUserId(user.getId());
        if (existing.isPresent()) {
            ProviderProfile p = existing.get();
            p.setBusinessName(businessName);
            p.setBio(bio);
            p.setExperienceYears(exp);
            p.setVerificationStatus(status);
            p.setCity(city);
            p.setState(state);
            p.setPostalCode(postalCode);
            p.setLatitude(lat);
            p.setLongitude(lng);
            p.setServiceRadiusKm(radiusKm);
            p.setRating(rating);
            p.setReviewCount(reviewCount);
            p.setAvailable(available);
            return providerProfileRepository.save(p);
        }
        ProviderProfile p = new ProviderProfile();
        p.setUser(user);
        p.setBusinessName(businessName);
        p.setBio(bio);
        p.setExperienceYears(exp);
        p.setVerificationStatus(status);
        p.setCity(city);
        p.setState(state);
        p.setPostalCode(postalCode);
        p.setLatitude(lat);
        p.setLongitude(lng);
        p.setServiceRadiusKm(radiusKm);
        p.setRating(rating);
        p.setReviewCount(reviewCount);
        p.setAvailable(available);
        return providerProfileRepository.save(p);
    }

    private void initProviderService(ProviderProfile provider, Service service, BigDecimal customPrice) {
        if (!providerServiceRepository.existsByProviderIdAndServiceId(provider.getId(), service.getId())) {
            ProviderService ps = new ProviderService();
            ps.setProvider(provider);
            ps.setService(service);
            ps.setCustomPrice(customPrice);
            ps.setAvailable(true);
            providerServiceRepository.save(ps);
        }
    }
}
