import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { locationService } from '../../services/locationService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MapView } from '../../components/map/MapView';
import { Button } from '../../components/common/Button';
import { LoadingSpinner, ErrorMessage } from '../../components/common/FeedbackStates';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  PlayCircle,
  XCircle,
  ArrowLeft,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Check
} from 'lucide-react';

export const ProviderBookingDetailsPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const b = await bookingService.getBookingById(bookingId);
      setBooking(b);
      const loc = await locationService.getLocationByProviderId(b.providerId || 1);
      setCustomerLocation(loc);
    } catch (err) {
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [bookingId]);

  const handleUpdateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await bookingService.updateBookingStatus(booking.id, newStatus);
      await fetchDetails();
    } catch (err) {
      alert(err.message || `Failed to update status to ${newStatus}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Job Details" subtitle="Loading..." />
        <div className="dashboard-content">
          <LoadingSpinner message="Fetching job details..." />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div>
        <DashboardHeader title="Job Details" subtitle="Error" />
        <div className="dashboard-content">
          <ErrorMessage message={error || 'Job not found'} onRetry={() => navigate('/provider/dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title={`Job #${booking.bookingReference}`}
        subtitle={`Customer: ${booking.customerName} • ${formatDate(booking.date)} at ${booking.time}`}
        actions={
          <Link to="/provider/requests" className="btn btn-sm btn-secondary">
            <ArrowLeft size={14} />
            <span>All Requests</span>
          </Link>
        }
      />

      <div className="dashboard-content">
        
        {/* Top Status & Milestone Action Banner */}
        <div className="card mb-6" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                  {booking.serviceName}
                </h3>
                <StatusBadge status={booking.status} />
              </div>
              <span className="text-xs text-muted">
                Order Placed: {new Date(booking.createdAt).toLocaleString()} • Ref: <strong className="font-mono">{booking.bookingReference}</strong>
              </span>
            </div>

            {/* Lifecycle Milestone Actions */}
            <div className="flex items-center gap-2">
              {booking.status === 'PENDING' && (
                <>
                  <Button
                    variant="secondary"
                    loading={actionLoading}
                    onClick={() => handleUpdateStatus('CANCELLED')}
                  >
                    <XCircle size={14} />
                    <span>Decline</span>
                  </Button>
                  <Button
                    variant="success"
                    loading={actionLoading}
                    onClick={() => handleUpdateStatus('CONFIRMED')}
                  >
                    <CheckCircle2 size={14} />
                    <span>Accept Job</span>
                  </Button>
                </>
              )}

              {booking.status === 'CONFIRMED' && (
                <Button
                  variant="primary"
                  loading={actionLoading}
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                >
                  <PlayCircle size={15} />
                  <span>Start Work (Arrived at Doorstep)</span>
                </Button>
              )}

              {booking.status === 'IN_PROGRESS' && (
                <Button
                  variant="success"
                  loading={actionLoading}
                  onClick={() => handleUpdateStatus('COMPLETED')}
                >
                  <CheckCircle2 size={15} />
                  <span>Mark Work Completed</span>
                </Button>
              )}

              {booking.status === 'COMPLETED' && (
                <span className="badge badge-verified" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  <CheckCircle2 size={14} />
                  <span>Job Completed & Verified</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="provider-job-grid">
          {/* LEFT: Customer, Location, Issue, Timeline */}
          <div className="flex flex-col gap-6">
            
            {/* Customer & Location Card */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                Customer & Doorstep Details
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
                  <span className="text-2xs text-muted block uppercase font-bold">Customer Name</span>
                  <strong className="text-sm block">{booking.customerName}</strong>
                  {booking.customerPhone && (
                    <span className="text-xs text-muted flex items-center gap-1 mt-05">
                      <Phone size={12} /> {booking.customerPhone}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-2xs text-muted block uppercase font-bold">Appointment Schedule</span>
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
                <div>
                  <span className="text-xs text-muted block font-semibold mb-1">Customer Issue Description:</span>
                  <p className="text-xs" style={{ color: 'var(--neutral-700)', backgroundColor: 'var(--white)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)', margin: 0 }}>
                    "{booking.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Job Lifecycle Timeline */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--neutral-900)' }}>
                Job Execution Progress
              </h4>

              <div className="timeline">
                {(booking.timeline || [
                  { step: 'Order Received', time: formatDate(booking.createdAt), done: true, desc: 'Customer placed booking request.' },
                  { step: 'Provider Accepted', time: booking.status !== 'PENDING' ? 'Accepted' : 'Pending Action', done: booking.status !== 'PENDING' && booking.status !== 'CANCELLED', desc: 'Appointment confirmed on provider schedule.' },
                  { step: 'In Progress (At Location)', time: booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED' ? 'In Progress' : 'Pending', done: booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED', desc: 'Technician arrived & performing diagnosis.' },
                  { step: 'Job Completed', time: booking.status === 'COMPLETED' ? 'Completed' : 'Pending', done: booking.status === 'COMPLETED', desc: 'Customer verified and tested repairs.' }
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

          {/* RIGHT: Payout Breakdown & Map */}
          <div className="flex flex-col gap-6">
            
            {/* Payout Summary */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                Payout & Billing Summary
              </h4>

              <div className="flex flex-col gap-2.5 mb-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Gross Job Amount</span>
                  <span>{formatCurrency(booking.price || 499)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Platform Service Fee (0% Launch Special)</span>
                  <span className="text-success font-semibold">₹0.00</span>
                </div>
                <div className="flex justify-between pt-3 border-top font-bold" style={{ borderTop: '1px solid var(--neutral-200)', fontSize: '1.15rem' }}>
                  <span style={{ color: 'var(--neutral-900)' }}>Net Provider Earnings</span>
                  <span style={{ color: 'var(--success-700)' }}>{formatCurrency(booking.price || 499)}</span>
                </div>
              </div>

              <p className="text-2xs text-muted mb-0" style={{ lineHeight: 1.4 }}>
                • Collect payment directly from customer upon job completion via UPI/Cash/Card.<br />
                • In case of additional parts or extended labor, agree on quotation before starting work.
              </p>
            </div>

            {/* Location Map Preview */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>
                Customer Location Map
              </h4>
              <p className="text-xs text-muted mb-3 flex items-center gap-1">
                <MapPin size={13} color="var(--primary-700)" />
                <span>{booking.address?.flat ? `${booking.address.flat}, ${booking.address.city}` : (booking.address?.city || 'Mumbai')}</span>
              </p>

              <div style={{ height: '220px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--neutral-200)' }}>
                <MapView
                  locations={customerLocation ? [customerLocation] : []}
                  selectedProviderId={booking.providerId}
                  height="220px"
                  showServiceRadius={true}
                  interactive={true}
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
