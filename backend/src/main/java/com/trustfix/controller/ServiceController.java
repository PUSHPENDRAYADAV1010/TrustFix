package com.trustfix.controller;

import com.trustfix.dto.mapper.ServiceMapper;
import com.trustfix.dto.service.ServiceRequest;
import com.trustfix.dto.service.ServiceResponse;
import com.trustfix.entity.Service;
import com.trustfix.service.ServiceCatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;
    private final ServiceMapper serviceMapper;

    public ServiceController(ServiceCatalogService serviceCatalogService, ServiceMapper serviceMapper) {
        this.serviceCatalogService = serviceCatalogService;
        this.serviceMapper = serviceMapper;
    }

    @PostMapping("/category/{categoryId}")
    public ResponseEntity<ServiceResponse> createService(
            @PathVariable Long categoryId,
            @Valid @RequestBody ServiceRequest request) {
        Service service = serviceMapper.toEntity(request);
        Service createdService = serviceCatalogService.createService(categoryId, service);
        return new ResponseEntity<>(serviceMapper.toResponse(createdService), HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> createServiceWithBodyOrParam(
            @RequestParam(required = false) Long categoryId,
            @Valid @RequestBody ServiceRequest request) {
        Long targetCatId = categoryId != null ? categoryId : (request != null ? request.getCategoryId() : null);
        if (targetCatId == null) {
            throw new com.trustfix.exception.BadRequestException("Category ID is required to create a service");
        }
        Service service = serviceMapper.toEntity(request);
        Service createdService = serviceCatalogService.createService(targetCatId, service);
        return new ResponseEntity<>(serviceMapper.toResponse(createdService), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        List<ServiceResponse> services = serviceCatalogService.getAllServices()
                .stream()
                .map(serviceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ServiceResponse>> getActiveServices() {
        List<ServiceResponse> services = serviceCatalogService.getActiveServices()
                .stream()
                .map(serviceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable Long id) {
        Service service = serviceCatalogService.getServiceById(id);
        return ResponseEntity.ok(serviceMapper.toResponse(service));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ServiceResponse>> getServicesByCategoryId(@PathVariable Long categoryId) {
        List<ServiceResponse> services = serviceCatalogService.getServicesByCategoryId(categoryId)
                .stream()
                .map(serviceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(services);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequest request) {
        Service updatedService = serviceMapper.toEntity(request);
        Service service = serviceCatalogService.updateService(id, updatedService);
        return ResponseEntity.ok(serviceMapper.toResponse(service));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateService(@PathVariable Long id) {
        serviceCatalogService.deactivateService(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceCatalogService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
