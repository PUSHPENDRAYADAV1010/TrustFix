import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { reviewService } from '../../services/reviewService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { LoadingSpinner, EmptyState } from '../../components/common/FeedbackStates';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  XCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Plus,
  Inbox,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchBookings = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await bookingService.getCustomerBookings(user.id);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(selectedBooking.id, cancelReason);
      setCancelModalOpen(false);
      await fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewClick = (booking) => {
    setReviewBooking(booking);
    setRating(5);
    setComment('');
    setReviewSuccess(false);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setActionLoading(true);
    try {
      await reviewService.createReview({
        bookingId: reviewBooking.id,
        rating,
        comment,
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewModalOpen(false);
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = filterStatus === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  const filterTabs = [
    { label: 'All', value: 'ALL', count: bookings.length },
    { label: 'Pending', value: 'PENDING', count: bookings.filter(b => b.status === 'PENDING').length },
    { label: 'Confirmed', value: 'CONFIRMED', count: bookings.filter(b => b.status === 'CONFIRMED').length },
    { label: 'In Progress', value: 'IN_PROGRESS', count: bookings.filter(b => b.status === 'IN_PROGRESS').length },
    { label: 'Completed', value: 'COMPLETED', count: bookings.filter(b => b.status === 'COMPLETED').length },
    { label: 'Cancelled', value: 'CANCELLED', count: bookings.filter(b => b.status === 'CANCELLED').length },
  ];

  return (
    <div>
      <DashboardHeader
        title="My Bookings"
        subtitle="Track, manage, and review your doorstep service appointments."
      />

      <div className="dashboard-content">
        
        {/* Status Filter Tabs */}
        <div className="card mb-6" style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--white)' }}>
          <div className="flex items-center gap-2 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`btn btn-sm ${filterStatus === tab.value ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setFilterStatus(tab.value)}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: filterStatus === tab.value ? 'rgba(255,255,255,0.25)' : 'var(--neutral-200)',
                    color: filterStatus === tab.value ? '#fff' : 'var(--neutral-700)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <LoadingSpinner message="Loading your bookings..." />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={filterStatus === 'ALL' ? "No bookings yet" : `No ${filterStatus.toLowerCase()} bookings found`}
            description="Explore our verified home service catalog to schedule your first repair appointment."
            action={
              <Link to="/customer/browse" className="btn btn-primary">
                <Plus size={14} />
                <span>Book a Service</span>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredBookings.map((b) => (
              <div key={b.id} className="card card-hoverable" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={b.status} />
                      <span className="text-2xs font-mono text-muted">REF: {b.bookingReference}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-900)', margin: '0 0 2px 0' }}>
                      {b.serviceName}
                    </h3>
                    <p className="text-xs text-muted">
                      Assigned Specialist: <strong style={{ color: 'var(--neutral-800)' }}>{b.providerName}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-muted block uppercase font-bold" style={{ letterSpacing: '0.04em' }}>Total Fee</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                      {formatCurrency(b.price || b.totalPrice || 499)}
                    </span>
                    <span className="text-2xs text-muted block">Pay on completion</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    backgroundColor: 'var(--neutral-50)',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-200)',
                    marginBottom: '1rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={15} color="var(--primary-700)" />
                    <span><strong>Date:</strong> {formatDate(b.date)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={15} color="var(--primary-700)" />
                    <span><strong>Time:</strong> {b.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={15} color="var(--primary-700)" />
                    <span className="text-truncate"><strong>Locality:</strong> {b.address?.flat ? `${b.address.flat}, ${b.address.city}` : (b.address?.city || 'Mumbai')}</span>
                  </div>
                </div>

                {b.status === 'CANCELLED' && b.cancellationReason && (
                  <div
                    style={{
                      backgroundColor: 'var(--neutral-100)',
                      borderLeft: '3px solid var(--danger-500)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.75rem',
                      fontSize: '0.75rem',
                      color: 'var(--neutral-700)',
                    }}
                  >
                    <strong>Cancelled:</strong> {b.cancellationReason}
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <ShieldCheck size={14} color="var(--success-600)" />
                    <span>30-Day TrustFix Warranty Active</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Allow cancel if PENDING or CONFIRMED */}
                    {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancelClick(b)}
                      >
                        <XCircle size={13} />
                        <span>Cancel Booking</span>
                      </button>
                    )}

                    {/* Allow review if COMPLETED */}
                    {b.status === 'COMPLETED' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleReviewClick(b)}
                      >
                        <Star size={13} />
                        <span>Rate & Review</span>
                      </button>
                    )}

                    <Link to={`/customer/bookings/${b.id}`} className="btn btn-sm btn-primary">
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Service Booking"
          footer={
            <>
              <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
                Keep Booking
              </Button>
              <Button variant="danger" loading={actionLoading} onClick={handleConfirmCancel}>
                Confirm Cancellation
              </Button>
            </>
          }
        >
          <div>
            <div className="alert alert-warning mb-4">
              <AlertCircle size={18} />
              <span>Are you sure you want to cancel booking <strong>{selectedBooking?.bookingReference}</strong>?</span>
            </div>
            <p className="text-xs text-muted mb-3">
              Since you have paid ₹0 in advance, no refund processing is required. Please let us know why you are cancelling:
            </p>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Reason for cancellation (e.g. Rescheduled plans, issue resolved)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        </Modal>

        {/* Review Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Rate & Review: ${reviewBooking?.serviceName || 'Service'}`}
          footer={
            !reviewSuccess && (
              <>
                <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} onClick={handleReviewSubmit}>
                  Submit Review
                </Button>
              </>
            )
          }
        >
          {reviewSuccess ? (
            <div className="text-center py-4">
              <CheckCircle2 size={36} color="var(--success-600)" style={{ margin: '0 auto 8px auto' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Thank you for your feedback!</h4>
              <p className="text-xs text-muted">Your verified review has been recorded.</p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <p className="text-xs text-muted mb-4">
                How was your experience with <strong>{reviewBooking?.providerName}</strong> for <strong>{reviewBooking?.serviceName}</strong>?
              </p>

              <div className="form-group mb-4 text-center">
                <label className="form-label mb-2">Select Star Rating</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star
                        size={28}
                        fill={star <= rating ? '#F59E0B' : 'none'}
                        color="#F59E0B"
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-muted block mt-1">{rating} out of 5 stars</span>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Review Comment (Optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Share details of technician punctuality, repair quality, or service experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </form>
          )}
        </Modal>

      </div>
    </div>
  );
};
