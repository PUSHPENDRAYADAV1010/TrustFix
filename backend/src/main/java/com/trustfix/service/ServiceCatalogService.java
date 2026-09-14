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
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));
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
    public List<Service> getActiveServices() {
        return serviceRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public Service updateService(Long id, Service updatedService) {
        Service existingService = getServiceById(id);

        if (updatedService.getName() != null && !updatedService.getName().isBlank()) {
            existingService.setName(updatedService.getName());
        }
        if (updatedService.getDescription() != null) {
            existingService.setDescription(updatedService.getDescription());
        }
        if (updatedService.getBasePrice() != null) {
            existingService.setBasePrice(updatedService.getBasePrice());
        }
        if (updatedService.getDurationInMinutes() != null) {
            existingService.setDurationInMinutes(updatedService.getDurationInMinutes());
        }
        if (updatedService.getImageUrl() != null) {
            existingService.setImageUrl(updatedService.getImageUrl());
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
