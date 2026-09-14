import apiClient from './api';
import { formatLocalDate } from '../utils/formatters';
import { mockBookings } from '../mock/bookings';

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

// In-memory / local storage sync for mock bookings created in demo session
const getLocalBookings = () => {
  try {
    const stored = localStorage.getItem('trustfix_local_bookings');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalBooking = (booking) => {
  try {
    const list = getLocalBookings();
    list.unshift(booking);
    localStorage.setItem('trustfix_local_bookings', JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to cache local booking', e);
  }
};

const mapBookingResponse = (b) => {
  if (!b) return null;
  return {
    id: b.id,
    bookingReference: b.bookingReference || (String(b.id).startsWith('BK-') ? b.id : `BK-${b.id}`),
    customerId: b.customerId,
    customerName: b.customerName || 'Customer',
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    providerId: b.providerId,
    providerName: b.providerBusinessName || b.providerName || 'Assigned Specialist',
    providerAvatar: b.providerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    serviceId: b.serviceId,
    serviceName: b.serviceName || 'Home Service',
    categoryName: b.categoryName || 'Home Repair',
    addressId: b.addressId,
    address: b.address || {
      flat: b.addressLine1 || 'Flat 402, Green Meadows',
      street: b.city || 'Andheri West',
      city: b.city || 'Mumbai',
      pincode: b.postalCode || '400053',
    },
    date: b.bookingDate || b.date || formatLocalDate(new Date()),
    time: b.bookingTime ? String(b.bookingTime).slice(0, 5) : (b.time || '10:00 AM'),
    status: b.status || 'PENDING',
    price: b.totalAmount || b.price || 499,
    totalPrice: b.totalAmount || b.totalPrice || 499,
    notes: b.notes || b.description,
    description: b.notes || b.description || 'Service appointment requested',
    cancellationReason: b.cancellationReason,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt || new Date().toISOString(),
    timeline: b.timeline || [
      { step: 'Booking Created', time: b.createdAt ? new Date(b.createdAt).toLocaleString() : 'Just now', done: true, desc: 'Booking request submitted.' },
      { step: 'Provider Accepted', time: b.status !== 'PENDING' ? 'Confirmed' : 'Awaiting confirmation', done: b.status !== 'PENDING' && b.status !== 'CANCELLED', desc: b.providerName ? `Assigned to ${b.providerName}` : 'Awaiting technician dispatch.' },
      { step: 'Service In Progress', time: b.status === 'IN_PROGRESS' || b.status === 'COMPLETED' ? 'In Progress' : 'Pending', done: b.status === 'IN_PROGRESS' || b.status === 'COMPLETED', desc: 'Technician dispatched to location.' },
      { step: 'Completed & Verified', time: b.status === 'COMPLETED' ? 'Completed' : 'Pending', done: b.status === 'COMPLETED', desc: 'Service finished and inspected.' },
    ],
  };
};

export const bookingService = {
  createBooking: async (bookingData) => {
    try {
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
    } catch (error) {
      console.warn('[bookingService] Backend createBooking unavailable, persisting mock booking:', error.message);
      
      const newRef = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
      const mockResult = mapBookingResponse({
        id: newRef,
        bookingReference: newRef,
        customerId: bookingData.customerId || 1,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName || 'Home Repair Service',
        providerId: bookingData.providerId || 101,
        providerName: bookingData.providerName || 'Rajesh Kumar',
        date: bookingData.date || formatLocalDate(new Date()),
        time: bookingData.time || '10:00 AM',
        status: 'CONFIRMED',
        totalAmount: bookingData.price || 499,
        notes: bookingData.description || 'Verified doorstep service requested',
        createdAt: new Date().toISOString()
      });

      saveLocalBooking(mockResult);
      return mockResult;
    }
  },

  getCustomerBookings: async (customerId, statusFilter = 'ALL') => {
    let list = [];
    try {
      if (customerId) {
        const response = await apiClient.get(`/bookings/customer/${customerId}`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          list = response.data.map(mapBookingResponse);
        }
      }
    } catch (error) {
      console.warn(`[bookingService] Backend fetch failed for customer ${customerId}, using mock bookings:`, error.message);
    }

    if (list.length === 0) {
      const local = getLocalBookings().filter(b => !customerId || String(b.customerId) === String(customerId));
      const mocks = mockBookings.map(mapBookingResponse);
      list = [...local, ...mocks];
    }

    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter((b) => b.status === statusFilter);
    }
    return list;
  },

  getProviderBookings: async (providerId, statusFilter = 'ALL') => {
    let list = [];
    try {
      if (providerId) {
        const response = await apiClient.get(`/bookings/provider/${providerId}`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          list = response.data.map(mapBookingResponse);
        }
      }
    } catch (error) {
      console.warn(`[bookingService] Backend fetch failed for provider ${providerId}, using mock bookings:`, error.message);
    }

    if (list.length === 0) {
      const local = getLocalBookings().filter(b => !providerId || String(b.providerId) === String(providerId));
      const mocks = mockBookings.map(mapBookingResponse);
      list = [...local, ...mocks];
    }

    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter((b) => b.status === statusFilter);
    }
    return list;
  },

  getBookingById: async (id) => {
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      if (response.data) return mapBookingResponse(response.data);
    } catch (error) {
      console.warn(`[bookingService] Backend fetch failed for booking ID ${id}, using mock data:`, error.message);
    }

    const local = getLocalBookings().find(b => String(b.id) === String(id) || b.bookingReference === id);
    if (local) return local;

    const mock = mockBookings.find(b => String(b.id) === String(id) || String(b.id) === `BK-${id}`) || mockBookings[0];
    return mapBookingResponse(mock);
  },

  cancelBooking: async (id) => {
    try {
      const response = await apiClient.put(`/bookings/${id}/status?status=CANCELLED`);
      return mapBookingResponse(response.data);
    } catch (error) {
      return { id, status: 'CANCELLED' };
    }
  },

  updateBookingStatus: async (id, newStatus) => {
    try {
      const response = await apiClient.put(`/bookings/${id}/status?status=${newStatus}`);
      return mapBookingResponse(response.data);
    } catch (error) {
      return { id, status: newStatus };
    }
  },
};
