import apiClient from './api';
import { resolveCustomerAvatar } from '../utils/imageResolver';
import { formatLocalDate } from '../utils/formatters';

export const reviewService = {
  getProviderReviews: async (providerId) => {
    if (!providerId) return [];
    try {
      const response = await apiClient.get(`/reviews/provider/${providerId}`);
      return response.data.map((r) => ({
        id: r.id,
        bookingId: r.bookingId,
        providerId: r.providerId,
        providerName: r.providerName,
        customerId: r.customerId,
        customerName: r.customerName || 'Verified Homeowner',
        customerAvatar: resolveCustomerAvatar({ id: r.customerId, name: r.customerName }),
        rating: r.rating || 5,
        date: r.createdAt ? r.createdAt.split('T')[0] : formatLocalDate(new Date()),
        serviceName: r.serviceName || 'Home Service',
        comment: r.comment || '',
        verifiedBooking: true,
      }));
    } catch (err) {
      console.error('Failed to fetch provider reviews:', err);
      return [];
    }
  },

  createReview: async ({ bookingId, rating, comment }) => {
    if (!bookingId) throw new Error('Booking ID is required to submit a review');
    const response = await apiClient.post(`/reviews/booking/${bookingId}`, {
      rating: Number(rating) || 5,
      comment: comment || '',
    });
    const r = response.data;
    return {
      id: r.id,
      bookingId: r.bookingId,
      providerId: r.providerId,
      providerName: r.providerName,
      customerId: r.customerId,
      customerName: r.customerName || 'Verified Homeowner',
      rating: r.rating || 5,
      date: r.createdAt ? r.createdAt.split('T')[0] : formatLocalDate(new Date()),
      serviceName: r.serviceName || 'Home Service',
      comment: r.comment || '',
      verifiedBooking: true,
    };
  },
};
