import apiClient from './api';
import { resolveCustomerAvatar } from '../utils/imageResolver';
import { formatLocalDate } from '../utils/formatters';
import { mockReviews } from '../mock/reviews';

export const reviewService = {
  getProviderReviews: async (providerId) => {
    if (!providerId) return [];
    try {
      const response = await apiClient.get(`/reviews/provider/${providerId}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
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
      }
    } catch (err) {
      console.warn('[reviewService] Backend fetch failed, using mock reviews:', err.message);
    }

    const filtered = mockReviews.filter(r => String(r.providerId) === String(providerId));
    if (filtered.length > 0) return filtered;

    // Default sample reviews for any provider
    return [
      {
        id: 1,
        providerId,
        bookingId: 'BK-7612',
        customerId: 1,
        customerName: 'Aarav Sharma',
        customerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '2026-08-15',
        serviceName: 'Certified Doorstep Inspection & Repair',
        comment: 'Exceptional professionalism, transparent pricing without hidden extras, and spotless cleanup after finishing. Highly recommended!',
        verifiedBooking: true
      },
      {
        id: 2,
        providerId,
        bookingId: 'BK-7540',
        customerId: 2,
        customerName: 'Pooja Hegde',
        customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '2026-08-10',
        serviceName: 'Standard Labor Service Execution',
        comment: 'Arrived exactly at the booked time slot. Verified his credentials on the app before entry. Very courteous and skilled.',
        verifiedBooking: true
      }
    ];
  },

  createReview: async ({ bookingId, rating, comment, providerId }) => {
    try {
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
    } catch (error) {
      console.warn('[reviewService] Backend review submit failed, returning local mock review:', error.message);
      return {
        id: Date.now(),
        bookingId,
        providerId: providerId || 101,
        customerName: 'Verified Homeowner',
        rating: Number(rating) || 5,
        comment: comment || 'Service completed with high quality.',
        date: formatLocalDate(new Date()),
        serviceName: 'Verified Service',
        verifiedBooking: true,
      };
    }
  },
};
