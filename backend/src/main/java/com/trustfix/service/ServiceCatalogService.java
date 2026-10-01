package com.trustfix.service;

import com.trustfix.entity.Category;
import com.trustfix.entity.Service;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.CategoryRepository;
import com.trustfix.repository.ServiceRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
@Transactional
@SuppressWarnings("null")
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;

    public ServiceCatalogService(ServiceRepository serviceRepository, CategoryRepository categoryRepository) {
        this.serviceRepository = serviceRepository;
        this.categoryRepository = categoryRepository;
    }

    public Service createService(Long categoryId, Service service) {
        if (service == null || service.getName() == null || service.getName().trim().isBlank()) {
            throw new com.trustfix.exception.BadRequestException("Service name is required and cannot be blank");
        }
        service.setName(service.getName().trim());
        if (service.getBasePrice() == null || service.getBasePrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new com.trustfix.exception.BadRequestException("Base price must be greater than or equal to 0");
        }
        if (service.getDurationInMinutes() != null && service.getDurationInMinutes() <= 0) {
            throw new com.trustfix.exception.BadRequestException("Duration must be greater than 0 minutes");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));

        if (service.isActive() && !category.isActive()) {
            throw new com.trustfix.exception.BadRequestException("Cannot create an active service in an inactive category");
        }

        service.setCategory(category);
        return serviceRepository.save(service);
    }

    @Transactional(readOnly = true)
    public Service getServiceById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Service> getServicesByCategoryId(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with ID: " + categoryId);
        }
        return serviceRepository.findByCategoryIdAndActiveTrue(categoryId);
    }

    @Transactional(readOnly = true)
    public List<Service> searchServices(String query) {
        if (query == null || query.trim().isBlank()) {
            return serviceRepository.findAll();
        }
        return serviceRepository.findByNameContainingIgnoreCase(query.trim());
    }

    @Transactional(readOnly = true)
    public List<Service> getActiveServices() {
        return serviceRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public Service updateService(Long id, Service updatedService) {
        Service existingService = getServiceById(id);

        if (updatedService.getName() != null) {
            String trimmedName = updatedService.getName().trim();
            if (trimmedName.isBlank()) {
                throw new com.trustfix.exception.BadRequestException("Service name cannot be blank");
            }
            existingService.setName(trimmedName);
        }
        if (updatedService.getDescription() != null) {
            existingService.setDescription(updatedService.getDescription());
        }
        if (updatedService.getBasePrice() != null) {
            if (updatedService.getBasePrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new com.trustfix.exception.BadRequestException("Base price must be greater than or equal to 0");
            }
            existingService.setBasePrice(updatedService.getBasePrice());
        }
        if (updatedService.getDurationInMinutes() != null) {
            if (updatedService.getDurationInMinutes() <= 0) {
                throw new com.trustfix.exception.BadRequestException("Duration must be greater than 0 minutes");
            }
            existingService.setDurationInMinutes(updatedService.getDurationInMinutes());
        }
        if (updatedService.getImageUrl() != null) {
            existingService.setImageUrl(updatedService.getImageUrl());
        }
        if (updatedService.getCategory() != null && updatedService.getCategory().getId() != null) {
            Long newCategoryId = updatedService.getCategory().getId();
            Category newCategory = categoryRepository.findById(newCategoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + newCategoryId));
            if (updatedService.isActive() && !newCategory.isActive()) {
                throw new com.trustfix.exception.BadRequestException("Cannot assign service to an inactive category while service is active");
            }
            existingService.setCategory(newCategory);
        }
        existingService.setActive(updatedService.isActive());

        return serviceRepository.save(existingService);
    }

    public void deactivateService(Long id) {
        Service service = getServiceById(id);
        service.setActive(false);
        serviceRepository.save(service);
    }

    public void deleteService(Long id) {
        Service service = getServiceById(id);
        serviceRepository.delete(service);
    }
}
