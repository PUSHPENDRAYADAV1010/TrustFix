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
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    serviceId: b.serviceId,
    serviceName: b.serviceName || 'Home Service',
    categoryName: b.categoryName || 'Home Repair',
    addressId: b.addressId,
    address: {
      flat: b.addressLine1 || '',
      street: b.city || '',
      city: b.city || '',
      pincode: b.postalCode || '',
    },
    date: b.bookingDate || formatLocalDate(new Date()),
    time: b.bookingTime ? String(b.bookingTime).slice(0, 5) : '10:00',
    status: b.status || 'PENDING',
    price: b.totalAmount || 0,
    totalPrice: b.totalAmount || 0,
    notes: b.notes || '',
    description: b.notes || 'Service appointment requested',
    cancellationReason: b.cancellationReason,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt || new Date().toISOString(),
    timeline: [
      { step: 'Booking Created', time: b.createdAt ? new Date(b.createdAt).toLocaleString() : 'Just now', done: true, desc: 'Booking request submitted.' },
      { step: 'Provider Accepted', time: b.status !== 'PENDING' ? 'Confirmed' : 'Awaiting confirmation', done: b.status !== 'PENDING' && b.status !== 'CANCELLED', desc: b.providerBusinessName ? `Assigned to ${b.providerBusinessName}` : 'Awaiting technician dispatch.' },
      { step: 'Service In Progress', time: b.status === 'IN_PROGRESS' || b.status === 'COMPLETED' ? 'In Progress' : 'Pending', done: b.status === 'IN_PROGRESS' || b.status === 'COMPLETED', desc: 'Technician dispatched to location.' },
      { step: 'Completed & Verified', time: b.status === 'COMPLETED' ? 'Completed' : 'Pending', done: b.status === 'COMPLETED', desc: 'Service finished and inspected.' },
    ],
  };
};

export const bookingService = {
  createBooking: async (bookingData) => {
    const customerId = bookingData.customerId;
    const serviceId = bookingData.serviceId;
    const addressId = bookingData.addressId;
    const providerId = bookingData.providerId;

    if (!serviceId) throw new Error('Please select a valid service to book.');
    if (!addressId) throw new Error('Valid address selection is required to create a booking.');

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
  },

  getCustomerBookings: async (customerId, statusFilter = 'ALL') => {
    if (!customerId) return [];
    const response = await apiClient.get(`/bookings/customer/${customerId}`);
    let list = Array.isArray(response.data) ? response.data.map(mapBookingResponse) : [];

    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter((b) => b.status === statusFilter);
    }
    return list;
  },

  getProviderBookings: async (providerId, statusFilter = 'ALL') => {
    if (!providerId) return [];
    const response = await apiClient.get(`/bookings/provider/${providerId}`);
    let list = Array.isArray(response.data) ? response.data.map(mapBookingResponse) : [];

    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter((b) => b.status === statusFilter);
    }
    return list;
  },

  getBookingById: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return mapBookingResponse(response.data);
  },

  cancelBooking: async (id, reason) => {
    let url = `/bookings/${id}/cancel`;
    const payload = reason ? { reason: reason.trim() } : {};
    const response = await apiClient.put(url, payload);
    return mapBookingResponse(response.data);
  },

  updateBookingStatus: async (id, newStatus, reason) => {
    let url = `/bookings/${id}/status?status=${newStatus}`;
    if (reason) {
      url += `&reason=${encodeURIComponent(reason)}`;
    }
    const response = await apiClient.put(url);
    return mapBookingResponse(response.data);
  },
};
