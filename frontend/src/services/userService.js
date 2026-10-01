import apiClient from './api';

export const userService = {
  getUserProfile: async (userId) => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      throw new Error('Valid User ID is required');
    }
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  updateUserProfile: async (userId, data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role || 'CUSTOMER',
      active: data.active !== undefined ? data.active : true,
    };
    const response = await apiClient.put(`/users/${userId}`, payload);
    return response.data;
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const response = await apiClient.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  deleteAccount: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  getAddresses: async (userId) => {
    if (!userId) return [];
    const response = await apiClient.get(`/addresses/user/${userId}`);
    const data = response.data;
    if (Array.isArray(data)) {
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
    return [];
  },

  addAddress: async (userId, addressData) => {
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
  },

  deleteAddress: async (addressId) => {
    await apiClient.delete(`/addresses/${addressId}`);
    return { success: true };
  },

  setDefaultAddress: async (addressId) => {
    const response = await apiClient.put(`/addresses/${addressId}/default`);
    return response.data;
  },
};
