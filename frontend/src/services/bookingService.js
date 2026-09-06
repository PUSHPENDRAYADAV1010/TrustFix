import apiClient from './api';
import { formatLocalDate } from '../utils/formatters';

const formatToTime = (timeStr) => {
  if (!timeStr) return '10:00:00';
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '10:00:00';
  let [_, hours, minutes, period] = match;
  let h = parseInt(hours, 10);
  if (period) {
    if (period.toUpperCase() === 'PM' && h < 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  }
  return `${String(h).padStart(2, '0')}:${minutes}:00`;
};

const mapBookingResponse = (b) => {
  if (!b) return null;
  return {
    id: b.id,
    bookingReference: b.bookingReference || `BK-${b.id}`,
    customerId: b.customerId,
    customerName: b.customerName || 'Customer',
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    providerId: b.providerId,
    providerName: b.providerBusinessName || 'Assigned Specialist',
    serviceId: b.serviceId,
    serviceName: b.serviceName || 'Home Service',
    addressId: b.addressId,
    address: {
      flat: b.addressLine1 || '',
      street: b.city || '',
      city: b.city || 'Mumbai',
      pincode: b.postalCode || '400001',
    },
    date: b.bookingDate || formatLocalDate(new Date()),
    time: b.bookingTime ? String(b.bookingTime).slice(0, 5) : '10:00',
    status: b.status || 'PENDING',
    price: b.totalAmount || 0,
    totalPrice: b.totalAmount || 0,
    notes: b.notes,
    description: b.notes || 'Service appointment requested',
    cancellationReason: b.cancellationReason,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt || new Date().toISOString(),
    timeline: [
      { step: 'Booking Created', time: b.createdAt ? new Date(b.createdAt).toLocaleString() : new Date().toLocaleString(), done: true, desc: 'Booking request submitted.' },
      { step: 'Provider Accepted', time: b.status !== 'PENDING' ? 'Confirmed' : 'Awaiting confirmation', done: b.status !== 'PENDING' && b.status !== 'CANCELLED', desc: b.providerBusinessName ? `Assigned to ${b.providerBusinessName}` : 'Awaiting technician dispatch.' },
      { step: 'Service In Progress', time: b.status === 'IN_PROGRESS' || b.status === 'COMPLETED' ? 'In Progress' : 'Pending', done: b.status === 'IN_PROGRESS' || b.status === 'COMPLETED', desc: 'Technician dispatched to location.' },
      { step: 'Completed & Verified', time: b.status === 'COMPLETED' ? 'Completed' : 'Pending', done: b.status === 'COMPLETED', desc: 'Service finished and inspected.' },
    ],
  };
};

export const bookingService = {
  // Real API create booking using POST /api/bookings
  createBooking: async (bookingData) => {
    try {
      const customerId = bookingData.customerId;
      const serviceId = bookingData.serviceId;
      const addressId = bookingData.addressId;
      const providerId = bookingData.providerId;

      if (!serviceId) {
        throw new Error('Please select a valid service to book.');
      }
      if (!addressId) {
        throw new Error('Valid address selection is required to create a booking.');
      }

      let url = `/bookings?customerId=${customerId}&serviceId=${serviceId}&addressId=${addressId}`;
      if (providerId && providerId !== 'undefined' && providerId !== 'null' && Number(providerId) > 0) {
        url += `&providerId=${providerId}`;
      }

      const body = {
        customerId: customerId ? Number(customerId) : undefined,
        serviceId: Number(serviceId),
        addressId: Number(addressId),
        providerId: providerId ? Number(providerId) : undefined,
        bookingDate: bookingData.date || formatLocalDate(new Date()),
        bookingTime: formatToTime(bookingData.time),
        totalAmount: bookingData.price || bookingData.totalAmount || undefined,
        notes: bookingData.description || bookingData.notes || 'Service appointment requested',
      };

      const response = await apiClient.post(url, body);
      return mapBookingResponse(response.data);
    } catch (error) {
      console.error('[bookingService] Error creating booking:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create booking.';
      throw new Error(errorMsg);
    }
  },

  // Real API get customer bookings using GET /api/bookings/customer/{customerId}
  getCustomerBookings: async (customerId, statusFilter = 'ALL') => {
    if (!customerId || customerId === 'undefined' || customerId === 'null') {
      return [];
    }
    try {
      const response = await apiClient.get(`/bookings/customer/${customerId}`);
      let list = Array.isArray(response.data) ? response.data.map(mapBookingResponse) : [];

      if (statusFilter && statusFilter !== 'ALL') {
        list = list.filter((b) => b.status === statusFilter);
      }
      return list;
    } catch (error) {
      console.error(`[bookingService] Error fetching bookings for customer ${customerId}:`, error);
      throw error;
    }
  },

  // Real API get provider bookings using GET /api/bookings/provider/{providerId}
  getProviderBookings: async (providerId, statusFilter = 'ALL') => {
    if (!providerId || providerId === 'undefined' || providerId === 'null') {
      return [];
    }
    try {
      const response = await apiClient.get(`/bookings/provider/${providerId}`);
      let list = Array.isArray(response.data) ? response.data.map(mapBookingResponse) : [];

      if (statusFilter && statusFilter !== 'ALL') {
        list = list.filter((b) => b.status === statusFilter);
      }
      return list;
    } catch (error) {
      console.error(`[bookingService] Error fetching bookings for provider ${providerId}:`, error);
      return [];
    }
  },

  // Real API get booking by ID using GET /api/bookings/{id}
  getBookingById: async (id) => {
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Valid Booking ID is required');
    }
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      return mapBookingResponse(response.data);
    } catch (error) {
      console.error(`[bookingService] Error fetching booking ${id}:`, error);
      throw error;
    }
  },

  // Real API cancel booking using PUT /api/bookings/{id}/status?status=CANCELLED
  cancelBooking: async (id, reason = 'Customer request') => {
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Valid Booking ID is required');
    }
    try {
      const response = await apiClient.put(`/bookings/${id}/status?status=CANCELLED`);
      return mapBookingResponse(response.data);
    } catch (error) {
      console.error(`[bookingService] Error cancelling booking ${id}:`, error);
      throw error;
    }
  },

  // Real API update status using PUT /api/bookings/{id}/status?status={status}
  updateBookingStatus: async (id, newStatus) => {
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Valid Booking ID is required');
    }
    try {
      const response = await apiClient.put(`/bookings/${id}/status?status=${newStatus}`);
      return mapBookingResponse(response.data);
    } catch (error) {
      console.error(`[bookingService] Error updating status for booking ${id}:`, error);
      throw error;
    }
  },
};
