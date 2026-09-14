import apiClient from './api';
import { mockAddresses } from '../mock/addresses';
import { mockUsers } from '../mock/users';

export const userService = {
  getUserProfile: async (userId) => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      throw new Error('Valid User ID is required');
    }
    try {
      const response = await apiClient.get(`/users/${userId}`);
      if (response.data) return response.data;
    } catch (error) {
      console.warn(`[userService] Error fetching user ${userId}, using mock:`, error.message);
    }
    return mockUsers.find(u => String(u.id) === String(userId)) || mockUsers[0];
  },

  updateUserProfile: async (userId, data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role || 'CUSTOMER',
        active: data.active !== undefined ? data.active : true,
      };
      const response = await apiClient.put(`/users/${userId}`, payload);
      return response.data;
    } catch (error) {
      return { id: userId, ...data };
    }
  },

  getAddresses: async (userId) => {
    try {
      if (userId) {
        const response = await apiClient.get(`/addresses/user/${userId}`);
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          return data.map((addr) => ({
            id: addr.id,
            label: addr.landmark || 'Home Address',
            flat: addr.addressLine1,
            street: addr.addressLine2 || addr.city,
            city: addr.city,
            state: addr.state,
            pincode: addr.postalCode,
            latitude: addr.latitude || 19.1136,
            longitude: addr.longitude || 72.8697,
            isDefault: addr.defaultAddress,
            addressLine1: addr.addressLine1,
            postalCode: addr.postalCode,
          }));
        }
      }
    } catch (error) {
      console.warn(`[userService] Backend fetch failed for addresses of user ${userId}, using mock addresses:`, error.message);
    }

    return mockAddresses.map(a => ({
      ...a,
      addressLine1: a.flat,
      postalCode: a.pincode
    }));
  },

  addAddress: async (userId, addressData) => {
    try {
      const payload = {
        addressLine1: addressData.flat,
        addressLine2: addressData.street,
        city: addressData.city || 'Mumbai',
        state: addressData.state || 'Maharashtra',
        postalCode: addressData.pincode || '400053',
        landmark: addressData.label || 'Home',
        defaultAddress: addressData.isDefault || false,
        latitude: addressData.latitude || 19.1136,
        longitude: addressData.longitude || 72.8697,
      };

      const response = await apiClient.post(`/addresses/user/${userId}`, payload);
      const addr = response.data;
      return {
        id: addr.id,
        label: addr.landmark || 'Home Address',
        flat: addr.addressLine1,
        street: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        pincode: addr.postalCode,
        latitude: addr.latitude,
        longitude: addr.longitude,
        isDefault: addr.defaultAddress,
      };
    } catch (error) {
      console.warn('[userService] Backend addAddress unavailable, creating local mock address:', error.message);
      return {
        id: Date.now(),
        userId,
        label: addressData.label || 'Home Address',
        flat: addressData.flat,
        street: addressData.street,
        city: addressData.city || 'Mumbai',
        state: addressData.state || 'Maharashtra',
        pincode: addressData.pincode || '400053',
        latitude: 19.1136,
        longitude: 72.8697,
        isDefault: false
      };
    }
  },

  deleteAddress: async (addressId) => {
    try {
      await apiClient.delete(`/addresses/${addressId}`);
      return { success: true };
    } catch (error) {
      return { success: true };
    }
  },

  setDefaultAddress: async (addressId) => {
    try {
      const response = await apiClient.put(`/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      return { success: true, id: addressId, defaultAddress: true };
    }
  },
};
