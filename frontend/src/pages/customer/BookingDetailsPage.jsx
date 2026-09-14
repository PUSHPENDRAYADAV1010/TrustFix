import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { locationService } from '../../services/locationService';
import { reviewService } from '../../services/reviewService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { MapView } from '../../components/map/MapView';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { LoadingSpinner, ErrorMessage } from '../../components/common/FeedbackStates';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  CreditCard,
  Check,
  Star
} from 'lucide-react';

export const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [providerLocation, setProviderLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;
    setReviewSubmitting(true);
    try {
      await reviewService.createReview({
        bookingId: booking.id,
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
      setReviewSubmitting(false);
    }
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const b = await bookingService.getBookingById(bookingId);
      setBooking(b);
      if (b.providerId) {
        const loc = await locationService.getLocationByProviderId(b.providerId);
        setProviderLocation(loc);
      }
    } catch (err) {
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [bookingId]);

  const handleConfirmCancel = async () => {
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(booking.id, cancelReason);
      setCancelModalOpen(false);
      await fetchDetails();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Booking Details" subtitle="Loading order status..." />
        <div className="dashboard-content">
          <LoadingSpinner message="Fetching order details..." />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div>
        <DashboardHeader title="Booking Details" subtitle="Error" />
        <div className="dashboard-content">
          <ErrorMessage message={error || 'Booking not found'} onRetry={() => navigate('/customer/bookings')} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title={`Booking #${booking.bookingReference}`}
        subtitle={`Scheduled for ${formatDate(booking.date)} at ${booking.time}`}
        actions={
          <Link to="/customer/bookings" className="btn btn-sm btn-secondary">
            <ArrowLeft size={14} />
            <span>All Bookings</span>
          </Link>
        }
      />

      <div className="dashboard-content">
        
        {/* Top Reference & Status Card */}
        <div className="card mb-6" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={22} strokeWidth={2.2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                    {booking.serviceName}
                  </h3>
                  <StatusBadge status={booking.status} />
                </div>
                <span className="text-xs text-muted">
                  Booking Reference: <strong className="font-mono">{booking.bookingReference}</strong> • Placed on {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {booking.status === 'COMPLETED' && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => {
                    setRating(5);
                    setComment('');
                    setReviewSuccess(false);
                    setReviewModalOpen(true);
                  }}
                >
                  <Star size={14} />
                  <span>Rate & Review</span>
                </button>
              )}

              {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setCancelModalOpen(true)}
                >
                  <XCircle size={14} />
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.7fr) minmax(300px, 1.1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}
          className="booking-details-grid"
        >
          {/* LEFT: Appointment Info & Visual Timeline */}
          <div className="flex flex-col gap-6">
            
            {/* Service & Provider Details Card */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                Service & Specialist Information
              </h4>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  backgroundColor: 'var(--neutral-50)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--neutral-200)',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <span className="text-2xs text-muted block uppercase font-bold">Assigned Specialist</span>
                  <strong className="text-sm block text-primary">{booking.providerName}</strong>
                  <span className="text-xs text-muted">TrustFix Certified</span>
                </div>

                <div>
                  <span className="text-2xs text-muted block uppercase font-bold">Visit Schedule</span>
                  <strong className="text-sm block">{formatDate(booking.date)}</strong>
                  <span className="text-xs text-muted">{booking.time} slot</span>
                </div>

                <div>
                  <span className="text-2xs text-muted block uppercase font-bold">Doorstep Address</span>
                  <strong className="text-sm block text-truncate">{booking.address?.flat ? `${booking.address.flat}, ${booking.address.city}` : (booking.address?.city || 'Mumbai')}</strong>
                  <span className="text-xs text-muted">{booking.address?.pincode}</span>
                </div>
              </div>

              {booking.notes && (
                <div style={{ marginTop: '0.75rem' }}>
                  <span className="text-xs text-muted block font-semibold mb-1">Customer Issue Notes:</span>
                  <p className="text-xs" style={{ color: 'var(--neutral-700)', backgroundColor: 'var(--white)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)', margin: 0 }}>
                    "{booking.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* 4-Step Visual Progress Timeline */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--neutral-900)' }}>
                Order Lifecycle Timeline
              </h4>

              <div className="timeline">
                {(booking.timeline || [
                  { step: 'Booking Created', time: formatDate(booking.createdAt), done: true, desc: 'Booking submitted on TrustFix.' },
                  { step: 'Provider Confirmed', time: booking.status !== 'PENDING' ? 'Confirmed' : 'Pending', done: booking.status !== 'PENDING' && booking.status !== 'CANCELLED', desc: `Assigned to ${booking.providerName}` },
                  { step: 'Service In Progress', time: booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED' ? 'In Progress' : 'Pending', done: booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED', desc: 'Technician on doorstep.' },
                  { step: 'Completed & Inspected', time: booking.status === 'COMPLETED' ? 'Completed' : 'Pending', done: booking.status === 'COMPLETED', desc: 'Job finished with 30-day warranty.' }
                ]).map((t, idx) => (
                  <div key={idx} className={`timeline-item ${t.done ? 'done' : ''}`}>
                    <div className="timeline-marker">
                      {t.done ? <Check size={12} strokeWidth={3} /> : idx + 1}
                    </div>
                    <div className="timeline-content">
                      <h5>{t.step}</h5>
                      <span className="timeline-time">{t.time}</span>
                      <p>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Price Breakdown & Map View */}
          <div className="flex flex-col gap-6">
            
            {/* Price Summary Card */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                Price Summary
              </h4>

              <div className="flex flex-col gap-2.5 mb-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Base Visit & Diagnostic Fee</span>
                  <span>{formatCurrency(booking.price || booking.totalPrice || 499)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Taxes & GST (18%)</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Advance Deposit Paid</span>
                  <span className="text-success font-semibold">₹0</span>
                </div>

                <div className="flex justify-between pt-3 border-top font-bold" style={{ borderTop: '1px solid var(--neutral-200)', fontSize: '1.15rem' }}>
                  <span style={{ color: 'var(--neutral-900)' }}>Total Due On Completion</span>
                  <span style={{ color: 'var(--primary-800)' }}>{formatCurrency(booking.price || booking.totalPrice || 499)}</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--success-50)',
                  border: '1px solid var(--success-100)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem',
                  fontSize: '11px',
                  color: 'var(--success-800)',
                }}
              >
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <ShieldCheck size={14} color="var(--success-600)" />
                  <span>TrustFix Payment Protection</span>
                </div>
                <span>Pay directly to the provider via UPI/Card/Cash only after your doorstep service is fully completed and inspected.</span>
              </div>
            </div>

            {/* Location Map Preview */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>
                Specialist Service Location
              </h4>
              <p className="text-xs text-muted mb-3 flex items-center gap-1">
                <MapPin size={13} color="var(--primary-700)" />
                <span>{booking.address?.flat ? `${booking.address.flat}, ${booking.address.city}` : (booking.address?.city || 'Mumbai')}</span>
              </p>

              <div style={{ height: '220px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--neutral-200)' }}>
                <MapView
                  locations={providerLocation ? [providerLocation] : []}
                  selectedProviderId={booking.providerId}
                  height="220px"
                  showServiceRadius={true}
                  interactive={true}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Cancellation Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Service Appointment"
          footer={
            <>
              <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
                Keep Appointment
              </Button>
              <Button variant="danger" loading={actionLoading} onClick={handleConfirmCancel}>
                Cancel Booking
              </Button>
            </>
          }
        >
          <div>
            <div className="alert alert-warning mb-4">
              <AlertCircle size={18} />
              <span>Are you sure you want to cancel booking <strong>{booking.bookingReference}</strong>?</span>
            </div>
            <p className="text-xs text-muted mb-3">
              No advance penalty applies. Please let us know the cancellation reason:
            </p>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        </Modal>

        {/* Rate & Review Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Rate & Review: ${booking?.serviceName || 'Service'}`}
          footer={
            !reviewSuccess && (
              <>
                <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" loading={reviewSubmitting} onClick={handleReviewSubmit}>
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
              <p className="text-xs text-muted">Your verified review has been recorded on the platform.</p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <p className="text-xs text-muted mb-4">
                How was your experience with <strong>{booking?.providerName}</strong> for <strong>{booking?.serviceName}</strong>?
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
