package com.trustfix.service;

import com.trustfix.entity.Address;
import com.trustfix.entity.User;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.AddressRepository;
import com.trustfix.repository.UserRepository;
import com.trustfix.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@SuppressWarnings("null")
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository, SecurityUtil securityUtil) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.securityUtil = securityUtil;
    }

    public Address addAddress(Long userId, Address address) {
        securityUtil.verifyUserOwnershipOrAdmin(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<Address> existingAddresses = addressRepository.findByUserId(userId);
        if (existingAddresses.isEmpty() || address.isDefaultAddress()) {
            unsetExistingDefaultAddress(userId);
            address.setDefaultAddress(true);
        }

        address.setUser(user);
        return addressRepository.save(address);
    }

    @Transactional(readOnly = true)
    public List<Address> getAddressesByUserId(Long userId) {
        securityUtil.verifyUserOwnershipOrAdmin(userId);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        return addressRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Address> getDefaultAddressByUserId(Long userId) {
        securityUtil.verifyUserOwnershipOrAdmin(userId);
        return addressRepository.findByUserIdAndDefaultAddressTrue(userId);
    }

    @Transactional(readOnly = true)
    public Address getAddressById(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + id));
        securityUtil.verifyAddressOwnershipOrAdmin(address);
        return address;
    }

    public Address updateAddress(Long addressId, Address updatedAddress) {
        Address existingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId));
        securityUtil.verifyAddressOwnershipOrAdmin(existingAddress);

        if (updatedAddress.isDefaultAddress() && !existingAddress.isDefaultAddress()) {
            unsetExistingDefaultAddress(existingAddress.getUser().getId());
            existingAddress.setDefaultAddress(true);
        }

        if (updatedAddress.getAddressLine1() != null) {
            existingAddress.setAddressLine1(updatedAddress.getAddressLine1());
        }
        if (updatedAddress.getAddressLine2() != null) {
            existingAddress.setAddressLine2(updatedAddress.getAddressLine2());
        }
        if (updatedAddress.getCity() != null) {
            existingAddress.setCity(updatedAddress.getCity());
        }
        if (updatedAddress.getState() != null) {
            existingAddress.setState(updatedAddress.getState());
        }
        if (updatedAddress.getPostalCode() != null) {
            existingAddress.setPostalCode(updatedAddress.getPostalCode());
        }
        if (updatedAddress.getCountry() != null) {
            existingAddress.setCountry(updatedAddress.getCountry());
        }
        if (updatedAddress.getLandmark() != null) {
            existingAddress.setLandmark(updatedAddress.getLandmark());
        }

        return addressRepository.save(existingAddress);
    }

    public void deleteAddress(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId));
        securityUtil.verifyAddressOwnershipOrAdmin(address);

        boolean wasDefault = address.isDefaultAddress();
        Long userId = address.getUser().getId();

        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefaultAddress(true);
                addressRepository.save(newDefault);
            }
        }
    }

    private void unsetExistingDefaultAddress(Long userId) {
        addressRepository.findByUserIdAndDefaultAddressTrue(userId)
                .ifPresent(existingDefault -> {
                    existingDefault.setDefaultAddress(false);
                    addressRepository.save(existingDefault);
                });
    }
}
