package com.trustfix.config;

import com.trustfix.entity.Category;
import com.trustfix.entity.Service;
import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import com.trustfix.repository.CategoryRepository;
import com.trustfix.repository.ServiceRepository;
import com.trustfix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ServiceRepository serviceRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.serviceRepository = serviceRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and initializing TrustFix production catalog & security seed data...");

        // 1. Purge legacy demo accounts using direct SQL to avoid cascade & orphan-removal issues
        try {
            jdbcTemplate.execute("DELETE r FROM reviews r JOIN users u ON r.customer_id = u.id WHERE u.email IN ('testprovider@gmail.com', 'testcustomer@gmail.com', 'priya.plumber@trustfix.com', 'amit.ac@trustfix.com', 'vikram.clean@trustfix.com', 'customer@trustfix.com', 'rajesh@trustfix.com', 'vikram@trustfix.com')");
            jdbcTemplate.execute("DELETE r FROM reviews r JOIN provider_profiles pp ON r.provider_id = pp.id JOIN users u ON pp.user_id = u.id WHERE u.email IN ('testprovider@gmail.com', 'testcustomer@gmail.com', 'priya.plumber@trustfix.com', 'amit.ac@trustfix.com', 'vikram.clean@trustfix.com', 'customer@trustfix.com', 'rajesh@trustfix.com', 'vikram@trustfix.com')");
            jdbcTemplate.execute("DELETE b FROM bookings b JOIN users u ON b.customer_id = u.id WHERE u.email IN ('testprovider@gmail.com', 'testcustomer@gmail.com', 'priya.plumber@trustfix.com', 'amit.ac@trustfix.com', 'vikram.clean@trustfix.com', 'customer@trustfix.com', 'rajesh@trustfix.com', 'vikram@trustfix.com')");
            jdbcTemplate.execute("DELETE b FROM bookings b JOIN provider_profiles pp ON b.provider_id = pp.id JOIN users u ON pp.user_id = u.id WHERE u.email IN ('testprovider@gmail.com', 'testcustomer@gmail.com', 'priya.plumber@trustfix.com', 'amit.ac@trustfix.com', 'vikram.clean@trustfix.com', 'customer@trustfix.com', 'rajesh@trustfix.com', 'vikram@trustfix.com')");
            jdbcTemplate.execute("DELETE ps FROM provider_services ps JOIN provider_profiles pp ON ps.provider_id = pp.id JOIN users u ON pp.user_id = u.id WHERE u.email IN ('testprovider@gmail.com', 'testcustomer@gmail.com', 'priya.plumber@trustfix.com', 'amit.ac@trustfix.com', 'vikram.clean@trustfix.com', 'customer@trustfix.com', 'rajesh@trustfix.com', 'vikram@trustfix.com')");
            jdbcTemplate.execute("DELETE pp FROM provider_profiles pp JOIN users u ON pp.user_id = u.id WHERE u.email IN ('testprovider@gmail.com', 'testcustomer@gmail.com', 'priya.plumber@trustfix.com', 'amit.ac@trustfix.com', 'vikram.clean@trustfix.com', 'customer@trustfix.com', 'rajesh@trustfix.com', 'vikram@trustfix.com')");
            jdbcTemplate.execute("DELETE a FROM addresses a JOIN users u ON a.user_id = u.id WHERE u.email IN ('testprovider@gmail.com', 'testcustomer@gmail.com', 'priya.plumber@trustfix.com', 'amit.ac@trustfix.com', 'vikram.clean@trustfix.com', 'customer@trustfix.com', 'rajesh@trustfix.com', 'vikram@trustfix.com')");
            jdbcTemplate.execute("DELETE FROM users WHERE email IN ('testprovider@gmail.com', 'testcustomer@gmail.com', 'priya.plumber@trustfix.com', 'amit.ac@trustfix.com', 'vikram.clean@trustfix.com', 'customer@trustfix.com', 'rajesh@trustfix.com', 'vikram@trustfix.com')");
        } catch (Exception e) {
            log.warn("Demo cleanup SQL notice: {}", e.getMessage());
        }

        // 2. Initialize Admin Account with standard and custom fallback
        String customAdminEmail = System.getenv("ADMIN_EMAIL");
        String adminPassword = System.getenv("ADMIN_PASSWORD");
        if (adminPassword == null || adminPassword.isBlank()) {
            adminPassword = "231182157800100950";
        }

        initUser("TrustFix Admin", "admin@trustfix.com", "+919820100001", adminPassword, UserRole.ADMIN);
        if (customAdminEmail != null && !customAdminEmail.isBlank() && !customAdminEmail.equalsIgnoreCase("admin@trustfix.com")) {
            initUser("Pushpendra Yadav (Admin)", customAdminEmail, "+919820100099", adminPassword, UserRole.ADMIN);
        }

        // Also ensure pushpendraydv1010@gmail.com has ADMIN role and password
        initUser("Pushpendra Yadav (Admin)", "pushpendraydv1010@gmail.com", "+919820100099", adminPassword, UserRole.ADMIN);

        // 3. Initialize Categories & Services Catalog
        Category electrical = initCategory("Electrical", "Certified electricians for wiring, fixtures, switchboards, and electrical repairs.", "⚡");
        Category plumbing = initCategory("Plumbing", "Expert plumbers for tap leaks, bathroom fixtures, drain cleaning & piping.", "🚰");
        Category cleaning = initCategory("Cleaning", "Professional home deep cleaning, kitchen sanitization & bathroom scrubbing.", "✨");
        Category acRepair = initCategory("AC Repair", "AC servicing, deep jet cleaning, cooling troubleshooting, and gas refill.", "❄️");
        Category applianceRepair = initCategory("Appliance Repair", "Skilled technicians for washing machines, refrigerators, and microwaves.", "🛠️");
        Category painting = initCategory("Painting", "Interior & exterior house painting, wall waterproofing, and color consultation.", "🎨");

        initService(electrical, "Electrical Repair & Inspection", "Complete inspection of switches, MCB trips, wiring issues, and sockets.", new BigDecimal("499.00"), 60, "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80");
        initService(electrical, "Switchboard & Socket Installation", "Installation of modular switchboards, high-power appliance points, and MCBs.", new BigDecimal("349.00"), 45, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80");
        initService(plumbing, "Plumbing Repair & Leakage Fix", "Inspection and repair of leaking taps, pipe joints, flush valves, and drains.", new BigDecimal("399.00"), 45, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80");
        initService(plumbing, "Bathroom Fixture Installation", "Installation of showers, washbasins, mixer taps, and health faucets.", new BigDecimal("599.00"), 60, "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=500&auto=format&fit=crop&q=80");
        initService(cleaning, "Full Home Deep Cleaning", "Intense scrubbing and sanitization of living areas, bedrooms, kitchen, and bathrooms.", new BigDecimal("1499.00"), 180, "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80");
        initService(cleaning, "Kitchen & Appliance Deep Clean", "Degreasing of gas stove, kitchen slabs, exhaust chimney, and cabinets.", new BigDecimal("899.00"), 120, "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&auto=format&fit=crop&q=80");
        initService(acRepair, "AC Deep Jet Servicing", "High-pressure jet pump cleaning of indoor cooling coils and outdoor unit.", new BigDecimal("599.00"), 45, "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80");
        initService(acRepair, "AC Cooling & Gas Refill", "Refrigerant leak test, vacuuming, and complete gas charging for split/window AC.", new BigDecimal("1899.00"), 60, "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80");
        initService(applianceRepair, "Washing Machine Diagnostic & Repair", "Motor inspection, drum rotation fix, water inlet valve and PCB troubleshooting.", new BigDecimal("499.00"), 60, "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80");
        initService(painting, "Interior Wall Painting & Touch-up", "Premium emulsion wall painting with surface putty prep and roller finish.", new BigDecimal("1299.00"), 240, "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80");

        log.info("TrustFix initialization completed successfully.");
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
