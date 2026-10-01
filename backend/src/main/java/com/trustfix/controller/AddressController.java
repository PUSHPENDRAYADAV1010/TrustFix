package com.trustfix.controller;

import com.trustfix.dto.address.AddressRequest;
import com.trustfix.dto.address.AddressResponse;
import com.trustfix.dto.mapper.AddressMapper;
import com.trustfix.entity.Address;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.service.AddressService;
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
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;
    private final AddressMapper addressMapper;

    public AddressController(AddressService addressService, AddressMapper addressMapper) {
        this.addressService = addressService;
        this.addressMapper = addressMapper;
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<AddressResponse> addAddress(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest request) {
        Address address = addressMapper.toEntity(request);
        Address createdAddress = addressService.addAddress(userId, address);
        return new ResponseEntity<>(addressMapper.toResponse(createdAddress), HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<AddressResponse> addAddressWithQueryParam(
            @RequestParam(required = false) Long userId,
            @Valid @RequestBody AddressRequest request) {
        Long targetUserId = userId != null ? userId : (request != null ? request.getUserId() : null);
        if (targetUserId == null) {
            throw new com.trustfix.exception.BadRequestException("User ID is required to add an address");
        }
        Address address = addressMapper.toEntity(request);
        Address createdAddress = addressService.addAddress(targetUserId, address);
        return new ResponseEntity<>(addressMapper.toResponse(createdAddress), HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AddressResponse>> getAddressesByUserId(@PathVariable Long userId) {
        List<AddressResponse> addresses = addressService.getAddressesByUserId(userId)
                .stream()
                .map(addressMapper::toResponse)
                .toList();
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/user/{userId}/default")
    public ResponseEntity<AddressResponse> getDefaultAddressByUserId(@PathVariable Long userId) {
        Address address = addressService.getDefaultAddressByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Default address not found for user ID: " + userId));
        return ResponseEntity.ok(addressMapper.toResponse(address));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponse> getAddressById(@PathVariable Long id) {
        Address address = addressService.getAddressById(id);
        return ResponseEntity.ok(addressMapper.toResponse(address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        Address updatedAddress = addressMapper.toEntity(request);
        Address address = addressService.updateAddress(id, updatedAddress);
        return ResponseEntity.ok(addressMapper.toResponse(address));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressResponse> setDefaultAddress(@PathVariable Long id) {
        Address update = new Address();
        update.setDefaultAddress(true);
        Address address = addressService.updateAddress(id, update);
        return ResponseEntity.ok(addressMapper.toResponse(address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
}
