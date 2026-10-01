package com.trustfix.controller;

import com.trustfix.dto.admin.AdminAssignProviderRequest;
import com.trustfix.dto.admin.AdminBookingResponse;
import com.trustfix.dto.admin.AdminBookingStatusRequest;
import com.trustfix.dto.admin.AdminDashboardResponse;
import com.trustfix.dto.admin.AdminProviderResponse;
import com.trustfix.dto.admin.AdminProviderVerificationRequest;
import com.trustfix.dto.admin.AdminReviewModerationRequest;
import com.trustfix.dto.admin.AdminReviewResponse;
import com.trustfix.dto.admin.AdminStatsResponse;
import com.trustfix.dto.admin.AdminUserResponse;
import com.trustfix.dto.admin.AdminUserStatusRequest;
import com.trustfix.dto.admin.PageResponse;
import com.trustfix.dto.category.CategoryRequest;
import com.trustfix.dto.category.CategoryResponse;
import com.trustfix.dto.service.ServiceRequest;
import com.trustfix.dto.service.ServiceResponse;
import com.trustfix.entity.BookingStatus;
import com.trustfix.entity.UserRole;
import com.trustfix.entity.VerificationStatus;
import com.trustfix.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ==================================================
    // 1. DASHBOARD & STATISTICS
    // ==================================================

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        AdminDashboardResponse dashboard = adminService.getAdminDashboard();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/statistics")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        AdminStatsResponse stats = adminService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

    // ==================================================
    // 2. USER MANAGEMENT
    // ==================================================

    @GetMapping("/users")
    public ResponseEntity<PageResponse<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AdminUserResponse> users = adminService.getUsers(search, role, active, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long id) {
        AdminUserResponse user = adminService.getUserDetails(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean active,
            @Valid @RequestBody(required = false) AdminUserStatusRequest request) {
        boolean targetActive = (request != null && request.getActive() != null)
                ? request.getActive()
                : (active != null ? active : true);
        AdminUserResponse updatedUser = adminService.updateUserStatus(id, targetActive);
        return ResponseEntity.ok(updatedUser);
    }

    // ==================================================
    // 3. PROVIDER VERIFICATION MANAGEMENT
    // ==================================================

    @GetMapping("/providers")
    public ResponseEntity<PageResponse<AdminProviderResponse>> getProviders(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AdminProviderResponse> providers = adminService.getProviders(status, search, pageable);
        return ResponseEntity.ok(providers);
    }

    @GetMapping("/providers/verifications")
    public ResponseEntity<PageResponse<AdminProviderResponse>> getPendingVerifications(
            @RequestParam(required = false, defaultValue = "PENDING") VerificationStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AdminProviderResponse> providers = adminService.getProviders(status, search, pageable);
        return ResponseEntity.ok(providers);
    }

    @GetMapping("/providers/{id}")
    public ResponseEntity<AdminProviderResponse> getProviderById(@PathVariable Long id) {
        AdminProviderResponse provider = adminService.getProviderDetails(id);
        return ResponseEntity.ok(provider);
    }

    @PutMapping("/providers/{id}/verify")
    public ResponseEntity<AdminProviderResponse> verifyProvider(
            @PathVariable Long id,
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(required = false) String rejectionReason,
            @Valid @RequestBody(required = false) AdminProviderVerificationRequest request) {
        VerificationStatus targetStatus = (request != null && request.getStatus() != null)
                ? request.getStatus()
                : status;
        String targetReason = (request != null && request.getRejectionReason() != null)
                ? request.getRejectionReason()
                : rejectionReason;
        AdminProviderResponse updated = adminService.verifyProvider(id, targetStatus, targetReason);
        return ResponseEntity.ok(updated);
    }

    // ==================================================
    // 4. CATEGORY MANAGEMENT
    // ==================================================

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active) {
        List<CategoryResponse> categories = adminService.getCategories(search, active);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = adminService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse created = adminService.createCategory(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse updated = adminService.updateCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/categories/{id}/status")
    public ResponseEntity<CategoryResponse> setCategoryStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        CategoryResponse updated = adminService.setCategoryStatus(id, active);
        return ResponseEntity.ok(updated);
    }

    // ==================================================
    // 5. SERVICE MANAGEMENT
    // ==================================================

    @GetMapping("/services")
    public ResponseEntity<List<ServiceResponse>> getServices(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active) {
        List<ServiceResponse> services = adminService.getServices(categoryId, search, active);
        return ResponseEntity.ok(services);
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable Long id) {
        ServiceResponse service = adminService.getServiceById(id);
        return ResponseEntity.ok(service);
    }

    @PostMapping("/services")
    public ResponseEntity<ServiceResponse> createService(@Valid @RequestBody ServiceRequest request) {
        ServiceResponse created = adminService.createService(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequest request) {
        ServiceResponse updated = adminService.updateService(id, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/services/{id}/status")
    public ResponseEntity<ServiceResponse> setServiceStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        ServiceResponse updated = adminService.setServiceStatus(id, active);
        return ResponseEntity.ok(updated);
    }

    // ==================================================
    // 6. BOOKING MANAGEMENT
    // ==================================================

    @GetMapping("/bookings")
    public ResponseEntity<PageResponse<AdminBookingResponse>> getBookings(
            @RequestParam(required = false) String reference,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AdminBookingResponse> bookings = adminService.getBookings(
                reference, status, customerId, providerId, bookingDate, pageable);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<AdminBookingResponse> getBookingById(@PathVariable Long id) {
        AdminBookingResponse booking = adminService.getBookingDetails(id);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/bookings/{id}/assign-provider")
    public ResponseEntity<AdminBookingResponse> assignProvider(
            @PathVariable Long id,
            @RequestParam(required = false) Long providerId,
            @Valid @RequestBody(required = false) AdminAssignProviderRequest request) {
        Long targetProviderId = (request != null && request.getProviderId() != null)
                ? request.getProviderId()
                : providerId;
        AdminBookingResponse assigned = adminService.assignProvider(id, targetProviderId);
        return ResponseEntity.ok(assigned);
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<AdminBookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String reason,
            @Valid @RequestBody(required = false) AdminBookingStatusRequest request) {
        BookingStatus targetStatus = (request != null && request.getStatus() != null)
                ? request.getStatus()
                : status;
        String targetReason = (request != null && request.getReason() != null)
                ? request.getReason()
                : reason;
        AdminBookingResponse updated = adminService.updateBookingStatus(id, targetStatus, targetReason);
        return ResponseEntity.ok(updated);
    }

    // ==================================================
    // 7. REVIEW MODERATION
    // ==================================================

    @GetMapping("/reviews")
    public ResponseEntity<PageResponse<AdminReviewResponse>> getReviews(
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) Boolean hidden,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AdminReviewResponse> reviews = adminService.getReviews(
                providerId, hidden, minRating, maxRating, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<AdminReviewResponse> getReviewById(@PathVariable Long id) {
        AdminReviewResponse review = adminService.getReviewDetails(id);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/reviews/{id}/moderate")
    public ResponseEntity<AdminReviewResponse> moderateReview(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean hidden,
            @RequestParam(required = false) String moderationReason,
            @Valid @RequestBody(required = false) AdminReviewModerationRequest request) {
        boolean targetHidden = (request != null)
                ? request.isHidden()
                : (hidden != null ? hidden : true);
        String targetReason = (request != null && request.getModerationReason() != null)
                ? request.getModerationReason()
                : moderationReason;
        AdminReviewResponse updated = adminService.moderateReview(id, targetHidden, targetReason);
        return ResponseEntity.ok(updated);
    }
}
