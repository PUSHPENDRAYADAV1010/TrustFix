package com.trustfix.service;

import com.trustfix.dto.admin.AdminBookingResponse;
import com.trustfix.dto.admin.AdminDashboardResponse;
import com.trustfix.dto.admin.AdminProviderResponse;
import com.trustfix.dto.admin.AdminReviewResponse;
import com.trustfix.dto.admin.AdminStatsResponse;
import com.trustfix.dto.admin.AdminUserResponse;
import com.trustfix.dto.admin.PageResponse;
import com.trustfix.dto.category.CategoryRequest;
import com.trustfix.dto.category.CategoryResponse;
import com.trustfix.dto.mapper.CategoryMapper;
import com.trustfix.dto.mapper.ServiceMapper;
import com.trustfix.dto.service.ServiceRequest;
import com.trustfix.dto.service.ServiceResponse;
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
import com.trustfix.exception.BadRequestException;
import com.trustfix.exception.ForbiddenException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.BookingRepository;
import com.trustfix.repository.CategoryRepository;
import com.trustfix.repository.ProviderProfileRepository;
import com.trustfix.repository.ProviderServiceRepository;
import com.trustfix.repository.ReviewRepository;
import com.trustfix.repository.ServiceRepository;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.SecurityUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@org.springframework.stereotype.Service
@Transactional
@SuppressWarnings("null")
public class AdminService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ProviderServiceRepository providerServiceRepository;
    private final CategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final ProviderProfileService providerProfileService;
    private final CategoryService categoryService;
    private final ServiceCatalogService serviceCatalogService;
    private final BookingService bookingService;
    private final ReviewService reviewService;
    private final CategoryMapper categoryMapper;
    private final ServiceMapper serviceMapper;
    private final SecurityUtil securityUtil;

    public AdminService(
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            ProviderServiceRepository providerServiceRepository,
            CategoryRepository categoryRepository,
            ServiceRepository serviceRepository,
            BookingRepository bookingRepository,
            ReviewRepository reviewRepository,
            ProviderProfileService providerProfileService,
            CategoryService categoryService,
            ServiceCatalogService serviceCatalogService,
            BookingService bookingService,
            ReviewService reviewService,
            CategoryMapper categoryMapper,
            ServiceMapper serviceMapper,
            SecurityUtil securityUtil) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.providerServiceRepository = providerServiceRepository;
        this.categoryRepository = categoryRepository;
        this.serviceRepository = serviceRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.providerProfileService = providerProfileService;
        this.categoryService = categoryService;
        this.serviceCatalogService = serviceCatalogService;
        this.bookingService = bookingService;
        this.reviewService = reviewService;
        this.categoryMapper = categoryMapper;
        this.serviceMapper = serviceMapper;
        this.securityUtil = securityUtil;
    }

    // ==================================================
    // 1. ADMIN DASHBOARD & STATISTICS
    // ==================================================

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        verifyAdminAccess();

        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(UserRole.CUSTOMER);
        long totalProviders = userRepository.countByRole(UserRole.PROVIDER);

        long verifiedProviders = providerProfileRepository.countByVerificationStatus(VerificationStatus.VERIFIED);
        long pendingProviders = providerProfileRepository.countByVerificationStatus(VerificationStatus.PENDING);
        long rejectedProviders = providerProfileRepository.countByVerificationStatus(VerificationStatus.REJECTED);

        long totalCategories = categoryRepository.count();
        long activeCategories = categoryRepository.countByActiveTrue();

        long totalServices = serviceRepository.count();
        long activeServices = serviceRepository.countByActiveTrue();

        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long inProgressBookings = bookingRepository.countByStatus(BookingStatus.IN_PROGRESS);
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);

        long totalReviews = reviewRepository.countByHiddenFalse();
        Double avgRatingRaw = reviewRepository.findAverageRatingAcrossPlatform();
        double averagePlatformRating = avgRatingRaw != null ? Math.round(avgRatingRaw * 100.0) / 100.0 : 0.0;

        BigDecimal totalBookingValue = bookingRepository.sumTotalAmountByStatus(BookingStatus.COMPLETED);
        if (totalBookingValue == null) {
            totalBookingValue = BigDecimal.ZERO;
        }

        double bookingCompletionRate = 0.0;
        if (completedBookings + cancelledBookings > 0) {
            bookingCompletionRate = Math.round(((double) completedBookings / (completedBookings + cancelledBookings)) * 1000.0) / 10.0;
        } else if (totalBookings > 0) {
            bookingCompletionRate = Math.round(((double) completedBookings / totalBookings) * 1000.0) / 10.0;
        }

        double cancellationRate = 0.0;
        if (totalBookings > 0) {
            cancellationRate = Math.round(((double) cancelledBookings / totalBookings) * 1000.0) / 10.0;
        }

        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setTotalUsers(totalUsers);
        response.setTotalCustomers(totalCustomers);
        response.setTotalProviders(totalProviders);
        response.setVerifiedProviders(verifiedProviders);
        response.setPendingProviders(pendingProviders);
        response.setRejectedProviders(rejectedProviders);
        response.setTotalCategories(totalCategories);
        response.setActiveCategories(activeCategories);
        response.setTotalServices(totalServices);
        response.setActiveServices(activeServices);
        response.setTotalBookings(totalBookings);
        response.setPendingBookings(pendingBookings);
        response.setConfirmedBookings(confirmedBookings);
        response.setInProgressBookings(inProgressBookings);
        response.setCompletedBookings(completedBookings);
        response.setCancelledBookings(cancelledBookings);
        response.setTotalReviews(totalReviews);
        response.setAveragePlatformRating(averagePlatformRating);
        response.setTotalBookingValue(totalBookingValue);
        response.setBookingCompletionRate(bookingCompletionRate);
        response.setCancellationRate(cancellationRate);

        return response;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getAdminStats() {
        AdminDashboardResponse dash = getAdminDashboard();

        AdminStatsResponse stats = new AdminStatsResponse();
        stats.setTotalUsers(dash.getTotalUsers());
        stats.setTotalCustomers(dash.getTotalCustomers());
        stats.setTotalProviders(dash.getTotalProviders());

        Map<String, Long> provStatus = new HashMap<>();
        provStatus.put("VERIFIED", dash.getVerifiedProviders());
        provStatus.put("PENDING", dash.getPendingProviders());
        provStatus.put("REJECTED", dash.getRejectedProviders());
        stats.setProvidersByVerificationStatus(provStatus);

        Map<String, Long> bookingStatus = new HashMap<>();
        bookingStatus.put("PENDING", dash.getPendingBookings());
        bookingStatus.put("CONFIRMED", dash.getConfirmedBookings());
        bookingStatus.put("IN_PROGRESS", dash.getInProgressBookings());
        bookingStatus.put("COMPLETED", dash.getCompletedBookings());
        bookingStatus.put("CANCELLED", dash.getCancelledBookings());
        stats.setBookingsByStatus(bookingStatus);

        stats.setTotalCategories(dash.getTotalCategories());
        stats.setActiveCategories(dash.getActiveCategories());
        stats.setTotalServices(dash.getTotalServices());
        stats.setActiveServices(dash.getActiveServices());
        stats.setTotalReviews(dash.getTotalReviews());
        stats.setAveragePlatformRating(dash.getAveragePlatformRating());
        stats.setTotalBookingValue(dash.getTotalBookingValue());
        stats.setCompletionRate(dash.getBookingCompletionRate());
        stats.setCancellationRate(dash.getCancellationRate());

        return stats;
    }

    // ==================================================
    // 2. USER MANAGEMENT
    // ==================================================

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getUsers(String search, UserRole role, Boolean active, Pageable pageable) {
        verifyAdminAccess();
        String effectiveSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<User> usersPage = userRepository.findUsersFiltered(effectiveSearch, role, active, pageable);
        return PageResponse.fromPage(usersPage, this::mapToAdminUserResponse);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUserDetails(Long userId) {
        verifyAdminAccess();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToAdminUserResponse(user);
    }

    public AdminUserResponse updateUserStatus(Long userId, boolean active) {
        verifyAdminAccess();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        User currentAdmin = securityUtil.getAuthenticatedUser();
        if (currentAdmin.getId().equals(userId) && !active) {
            throw new BadRequestException("Administrators cannot deactivate their own account");
        }

        user.setActive(active);
        User savedUser = userRepository.save(user);
        return mapToAdminUserResponse(savedUser);
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        long bookingCount = 0;
        long reviewCount = 0;
        Long providerId = null;
        String businessName = null;
        VerificationStatus verificationStatus = null;

        if (user.getRole() == UserRole.CUSTOMER) {
            bookingCount = bookingRepository.countByCustomerId(user.getId());
            reviewCount = reviewRepository.findByCustomerId(user.getId()).size();
        } else if (user.getRole() == UserRole.PROVIDER) {
            ProviderProfile profile = providerProfileRepository.findByUserId(user.getId()).orElse(null);
            if (profile != null) {
                providerId = profile.getId();
                businessName = profile.getBusinessName();
                verificationStatus = profile.getVerificationStatus();
                bookingCount = bookingRepository.countByProviderId(profile.getId());
                reviewCount = profile.getReviewCount();
            }
        }

        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                bookingCount,
                reviewCount,
                providerId,
                businessName,
                verificationStatus
        );
    }

    // ==================================================
    // 3. PROVIDER VERIFICATION MANAGEMENT
    // ==================================================

    @Transactional(readOnly = true)
    public PageResponse<AdminProviderResponse> getProviders(VerificationStatus status, String search, Pageable pageable) {
        verifyAdminAccess();
        String effectiveSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<ProviderProfile> page = providerProfileRepository.findProvidersFiltered(status, effectiveSearch, pageable);
        return PageResponse.fromPage(page, this::mapToAdminProviderResponse);
    }

    @Transactional(readOnly = true)
    public AdminProviderResponse getProviderDetails(Long providerId) {
        verifyAdminAccess();
        ProviderProfile profile = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with ID: " + providerId));
        return mapToAdminProviderResponse(profile);
    }

    public AdminProviderResponse verifyProvider(Long providerId, VerificationStatus status, String rejectionReason) {
        verifyAdminAccess();
        ProviderProfile updated = providerProfileService.updateVerificationStatus(providerId, status, rejectionReason);
        return mapToAdminProviderResponse(updated);
    }

    private AdminProviderResponse mapToAdminProviderResponse(ProviderProfile profile) {
        AdminProviderResponse resp = new AdminProviderResponse();
        resp.setId(profile.getId());
        if (profile.getUser() != null) {
            resp.setUserId(profile.getUser().getId());
            resp.setUserName(profile.getUser().getName());
            resp.setUserEmail(profile.getUser().getEmail());
            resp.setUserPhone(profile.getUser().getPhone());
            resp.setUserActive(profile.getUser().isActive());
        }
        resp.setBusinessName(profile.getBusinessName());
        resp.setBio(profile.getBio());
        resp.setExperienceYears(profile.getExperienceYears());
        resp.setVerificationStatus(profile.getVerificationStatus());
        resp.setRejectionReason(profile.getRejectionReason());
        resp.setAvailable(profile.isAvailable());
        resp.setDocumentUrl(profile.getDocumentUrl());
        resp.setLatitude(profile.getLatitude());
        resp.setLongitude(profile.getLongitude());
        resp.setServiceRadiusKm(profile.getServiceRadiusKm());
        resp.setCity(profile.getCity());
        resp.setState(profile.getState());
        resp.setPostalCode(profile.getPostalCode());
        resp.setRating(profile.getRating());
        resp.setReviewCount(profile.getReviewCount());

        long totalBookings = bookingRepository.countByProviderId(profile.getId());
        long completedBookings = bookingRepository.countByProviderIdAndStatus(profile.getId(), BookingStatus.COMPLETED);
        resp.setTotalBookings(totalBookings);
        resp.setCompletedBookings(completedBookings);

        List<ProviderService> services = providerServiceRepository.findByProviderId(profile.getId());
        resp.setActiveServicesCount(services.stream().filter(ProviderService::isAvailable).count());
        resp.setOfferedServices(services.stream()
                .filter(ps -> ps.getService() != null)
                .map(ps -> ps.getService().getName())
                .toList());

        return resp;
    }

    // ==================================================
    // 4. CATEGORY MANAGEMENT
    // ==================================================

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(String search, Boolean active) {
        verifyAdminAccess();
        List<Category> list;
        if (search != null && !search.trim().isEmpty()) {
            list = categoryService.searchCategories(search);
        } else if (Boolean.TRUE.equals(active)) {
            list = categoryService.getActiveCategories();
        } else {
            list = categoryService.getAllCategories();
        }

        if (active != null && (search != null && !search.trim().isEmpty())) {
            list = list.stream().filter(c -> c.isActive() == active).toList();
        }

        return list.stream().map(categoryMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        verifyAdminAccess();
        Category category = categoryService.getCategoryById(id);
        return categoryMapper.toResponse(category);
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        verifyAdminAccess();
        Category entity = categoryMapper.toEntity(request);
        Category created = categoryService.createCategory(entity);
        return categoryMapper.toResponse(created);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        verifyAdminAccess();
        Category entity = categoryMapper.toEntity(request);
        Category updated = categoryService.updateCategory(id, entity);
        return categoryMapper.toResponse(updated);
    }

    public CategoryResponse setCategoryStatus(Long id, boolean active) {
        verifyAdminAccess();
        Category category = categoryService.getCategoryById(id);
        category.setActive(active);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    // ==================================================
    // 5. SERVICE MANAGEMENT
    // ==================================================

    @Transactional(readOnly = true)
    public List<ServiceResponse> getServices(Long categoryId, String search, Boolean active) {
        verifyAdminAccess();
        List<Service> list;
        if (categoryId != null) {
            list = serviceCatalogService.getServicesByCategoryId(categoryId);
        } else if (search != null && !search.trim().isEmpty()) {
            list = serviceCatalogService.searchServices(search);
        } else if (Boolean.TRUE.equals(active)) {
            list = serviceCatalogService.getActiveServices();
        } else {
            list = serviceCatalogService.getAllServices();
        }

        if (active != null) {
            list = list.stream().filter(s -> s.isActive() == active).toList();
        }

        return list.stream().map(serviceMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(Long id) {
        verifyAdminAccess();
        Service service = serviceCatalogService.getServiceById(id);
        return serviceMapper.toResponse(service);
    }

    public ServiceResponse createService(ServiceRequest request) {
        verifyAdminAccess();
        if (request.getCategoryId() == null) {
            throw new BadRequestException("Category ID is required when creating a service");
        }
        Service entity = serviceMapper.toEntity(request);
        Service created = serviceCatalogService.createService(request.getCategoryId(), entity);
        return serviceMapper.toResponse(created);
    }

    public ServiceResponse updateService(Long id, ServiceRequest request) {
        verifyAdminAccess();
        Service entity = serviceMapper.toEntity(request);
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
            entity.setCategory(category);
        }
        Service updated = serviceCatalogService.updateService(id, entity);
        return serviceMapper.toResponse(updated);
    }

    public ServiceResponse setServiceStatus(Long id, boolean active) {
        verifyAdminAccess();
        Service service = serviceCatalogService.getServiceById(id);
        service.setActive(active);
        Service saved = serviceRepository.save(service);
        return serviceMapper.toResponse(saved);
    }

    // ==================================================
    // 6. BOOKING MANAGEMENT
    // ==================================================

    @Transactional(readOnly = true)
    public PageResponse<AdminBookingResponse> getBookings(
            String reference,
            BookingStatus status,
            Long customerId,
            Long providerId,
            LocalDate bookingDate,
            Pageable pageable) {
        verifyAdminAccess();
        String effectiveRef = (reference != null && !reference.trim().isEmpty()) ? reference.trim() : null;
        Page<Booking> page = bookingRepository.findBookingsFiltered(
                effectiveRef, status, customerId, providerId, bookingDate, pageable);
        return PageResponse.fromPage(page, this::mapToAdminBookingResponse);
    }

    @Transactional(readOnly = true)
    public AdminBookingResponse getBookingDetails(Long id) {
        verifyAdminAccess();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        return mapToAdminBookingResponse(booking);
    }

    public AdminBookingResponse assignProvider(Long bookingId, Long providerId) {
        verifyAdminAccess();
        Booking updated = bookingService.assignProvider(bookingId, providerId);
        return mapToAdminBookingResponse(updated);
    }

    public AdminBookingResponse updateBookingStatus(Long bookingId, BookingStatus status, String reason) {
        verifyAdminAccess();
        Booking updated = bookingService.updateBookingStatus(bookingId, status, reason);
        return mapToAdminBookingResponse(updated);
    }

    private AdminBookingResponse mapToAdminBookingResponse(Booking booking) {
        AdminBookingResponse resp = new AdminBookingResponse();
        resp.setId(booking.getId());
        resp.setBookingReference(booking.getBookingReference());

        if (booking.getCustomer() != null) {
            resp.setCustomerId(booking.getCustomer().getId());
            resp.setCustomerName(booking.getCustomer().getName());
            resp.setCustomerEmail(booking.getCustomer().getEmail());
            resp.setCustomerPhone(booking.getCustomer().getPhone());
        }

        if (booking.getProvider() != null) {
            resp.setProviderId(booking.getProvider().getId());
            resp.setProviderBusinessName(booking.getProvider().getBusinessName());
        }

        if (booking.getService() != null) {
            resp.setServiceId(booking.getService().getId());
            resp.setServiceName(booking.getService().getName());
            if (booking.getService().getCategory() != null) {
                resp.setCategoryName(booking.getService().getCategory().getName());
            }
        }

        if (booking.getAddress() != null) {
            resp.setAddressId(booking.getAddress().getId());
            resp.setFormattedAddress(booking.getAddress().getStreetAddress() + ", " +
                    booking.getAddress().getCity() + ", " +
                    booking.getAddress().getState() + " - " +
                    booking.getAddress().getPostalCode());
        }

        resp.setBookingDate(booking.getBookingDate());
        resp.setBookingTime(booking.getBookingTime());
        resp.setStatus(booking.getStatus());
        resp.setTotalAmount(booking.getTotalAmount());
        resp.setNotes(booking.getNotes());
        resp.setCancellationReason(booking.getCancellationReason());
        resp.setCreatedAt(booking.getCreatedAt());
        resp.setUpdatedAt(booking.getUpdatedAt());

        return resp;
    }

    // ==================================================
    // 7. REVIEW MODERATION
    // ==================================================

    @Transactional(readOnly = true)
    public PageResponse<AdminReviewResponse> getReviews(
            Long providerId,
            Boolean hidden,
            Integer minRating,
            Integer maxRating,
            Pageable pageable) {
        verifyAdminAccess();
        Page<Review> page = reviewRepository.findReviewsFiltered(providerId, hidden, minRating, maxRating, pageable);
        return PageResponse.fromPage(page, this::mapToAdminReviewResponse);
    }

    @Transactional(readOnly = true)
    public AdminReviewResponse getReviewDetails(Long id) {
        verifyAdminAccess();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + id));
        return mapToAdminReviewResponse(review);
    }

    public AdminReviewResponse moderateReview(Long reviewId, boolean hidden, String moderationReason) {
        verifyAdminAccess();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));

        review.setHidden(hidden);
        if (hidden && (moderationReason == null || moderationReason.trim().isEmpty())) {
            review.setModerationReason("Hidden by platform administrator");
        } else if (moderationReason != null) {
            review.setModerationReason(moderationReason.trim());
        } else {
            review.setModerationReason(null);
        }

        Review saved = reviewRepository.save(review);

        // Recalculate provider rating stats with active non-hidden reviews
        if (saved.getProvider() != null) {
            reviewService.updateProviderRatingStats(saved.getProvider().getId());
        }

        return mapToAdminReviewResponse(saved);
    }

    private AdminReviewResponse mapToAdminReviewResponse(Review review) {
        AdminReviewResponse resp = new AdminReviewResponse();
        resp.setId(review.getId());
        if (review.getBooking() != null) {
            resp.setBookingId(review.getBooking().getId());
            resp.setBookingReference(review.getBooking().getBookingReference());
            if (review.getBooking().getService() != null) {
                resp.setServiceName(review.getBooking().getService().getName());
            }
        }
        if (review.getCustomer() != null) {
            resp.setCustomerId(review.getCustomer().getId());
            resp.setCustomerName(review.getCustomer().getName());
            resp.setCustomerEmail(review.getCustomer().getEmail());
        }
        if (review.getProvider() != null) {
            resp.setProviderId(review.getProvider().getId());
            resp.setProviderBusinessName(review.getProvider().getBusinessName());
        }
        resp.setRating(review.getRating());
        resp.setComment(review.getComment());
        resp.setHidden(review.isHidden());
        resp.setModerationReason(review.getModerationReason());
        resp.setCreatedAt(review.getCreatedAt());
        resp.setUpdatedAt(review.getUpdatedAt());
        return resp;
    }

    private void verifyAdminAccess() {
        if (!securityUtil.isAdmin()) {
            throw new ForbiddenException("Access Denied: Administrative privileges required");
        }
    }
}
