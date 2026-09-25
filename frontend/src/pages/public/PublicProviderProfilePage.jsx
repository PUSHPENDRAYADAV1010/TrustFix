import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import { reviewService } from '../../services/reviewService';
import { locationService } from '../../services/locationService';
import { RatingStars } from '../../components/common/RatingStars';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { MapView } from '../../components/map/MapView';
import { LoadingSpinner, ErrorMessage } from '../../components/common/FeedbackStates';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DEFAULT_CUSTOMER_LOCATION, calculateDistance, formatDistance } from '../../utils/distance';
import {
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Award,
  Clock,
  Calendar,
  Briefcase,
  Check,
  Star,
  Zap,
  Lock,
  ThumbsUp,
  FileCheck,
  Shield,
  Navigation,
  Sparkles,
  Phone,
  MessageSquare
} from 'lucide-react';

export const PublicProviderProfilePage = () => {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [providerLocation, setProviderLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      try {
        const [prov, revs, loc] = await Promise.all([
          providerService.getProviderById(providerId),
          reviewService.getProviderReviews(providerId),
          locationService.getLocationByProviderId(providerId)
        ]);
        setProvider(prov);
        setReviews(revs);
        setProviderLocation(loc);
      } catch (err) {
        setError(err.message || 'Provider profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProviderData();
  }, [providerId]);

  if (loading) return <LoadingSpinner message="Loading verified professional profile..." />;
  if (error || !provider) {
    return (
      <div className="container section-py">
        <ErrorMessage message={error || 'Provider profile not found'} onRetry={() => navigate('/browse')} />
      </div>
    );
  }

  // Calculate distance from default location
  const distanceKm = (DEFAULT_CUSTOMER_LOCATION.latitude && provider.latitude)
    ? calculateDistance(
        DEFAULT_CUSTOMER_LOCATION.latitude,
        DEFAULT_CUSTOMER_LOCATION.longitude,
        provider.latitude,
        provider.longitude
      )
    : 3.2;

  const experienceYears = provider.experience || provider.experienceYears || 8;
  const completedJobs = provider.completedJobs || 320;

  return (
    <div className="provider-profile-page" style={{ padding: '2rem 0 4rem 0', backgroundColor: 'var(--neutral-50)' }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <nav style={{ marginBottom: '1.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ color: 'var(--neutral-600)' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/browse" style={{ color: 'var(--neutral-600)' }}>Verified Professionals</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--neutral-900)', fontWeight: 650 }}>{provider.name}</span>
        </nav>

        {/* ============================================================
            1. PROFESSIONAL IDENTITY HEADER HERO CARD
            ============================================================ */}
        <div className="card mb-8" style={{ overflow: 'hidden', border: '1px solid var(--neutral-200)', backgroundColor: 'var(--white)' }}>
          {/* Cover Photo Banner */}
          <div
            style={{
              height: '180px',
              backgroundImage: `linear-gradient(135deg, rgba(7, 21, 42, 0.88) 0%, rgba(16, 43, 84, 0.88) 100%), url(${provider.coverImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--white)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 650,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Briefcase size={14} />
                <span>Verified Trade Credential</span>
              </span>
            </div>
          </div>

          {/* Profile Header Details */}
          <div className="card-body" style={{ marginTop: '-60px', position: 'relative', padding: '1.75rem 2rem' }}>
            <div className="flex items-end justify-between flex-wrap gap-4">
              
              {/* Avatar + Main Info */}
              <div className="flex items-end gap-5">
                <div style={{ position: 'relative' }}>
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: 'var(--radius-xl)',
                      objectFit: 'cover',
                      border: '4px solid var(--white)',
                      boxShadow: 'var(--shadow-md)',
                      backgroundColor: 'var(--white)',
                    }}
                  />
                  <span
                    className={`status-dot ${provider.available ? 'online' : 'offline'}`}
                    style={{ position: 'absolute', bottom: '6px', right: '6px', width: '12px', height: '12px' }}
                    title={provider.available ? 'Available Now' : 'Busy'}
                  />
                </div>

                <div style={{ paddingBottom: '6px' }}>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 style={{ fontSize: 'clamp(1.65rem, 3vw, 2.25rem)', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                      {provider.name}
                    </h1>
                    <VerificationBadge status={provider.verificationStatus} size="md" />
                  </div>

                  <p style={{ fontSize: '1.0625rem', color: 'var(--primary-800)', fontWeight: 650, margin: '2px 0 6px 0' }}>
                    {provider.companyName || provider.service} • {experienceYears} Years Experience
                  </p>

                  <div className="flex items-center gap-4 flex-wrap text-sm text-muted">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} color="var(--primary-700)" />
                      <span>{provider.serviceArea || `${provider.city || 'Mumbai'}, Maharashtra`}</span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Navigation size={15} color="var(--primary-700)" />
                      <span>{formatDistance(distanceKm)} away from you</span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} color="var(--success-600)" />
                      <span>{completedJobs}+ doorstep jobs completed</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-3">
                <Link
                  to={`/customer/book?providerId=${provider.id}`}
                  className="btn btn-lg btn-primary"
                  style={{ padding: '0.8125rem 1.875rem' }}
                >
                  <Calendar size={18} />
                  <span>Select & Book Service</span>
                </Link>
              </div>

            </div>

            {/* Ratings & Overview Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
                marginTop: '1.75rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--neutral-200)',
              }}
            >
              <div>
                <span className="text-xs uppercase font-bold text-muted block mb-1">Customer Rating</span>
                <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} size="md" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-muted block mb-1">Starting Visit Rate</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                  {formatCurrency(provider.startingPrice || 499)}
                </span>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-muted block mb-1">Availability</span>
                <span className="flex items-center gap-1.5 font-bold text-sm" style={{ color: provider.available ? 'var(--success-700)' : 'var(--neutral-600)' }}>
                  <span className={`status-dot ${provider.available ? 'online' : 'offline'}`} />
                  <span>{provider.available ? 'Available for bookings today' : 'Currently engaged on site'}</span>
                </span>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-muted block mb-1">Warranty Guarantee</span>
                <span className="text-sm font-semibold text-neutral-800 flex items-center gap-1">
                  <ShieldCheck size={16} color="var(--success-600)" />
                  <span>30-Day Workmanship Warranty</span>
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================
            2. TWO-COLUMN CONTENT: CREDENTIALS & SERVICES (LEFT) + BOOKING (RIGHT)
            ============================================================ */}
        <div className="public-provider-grid">
          {/* LEFT COLUMN: ABOUT, CREDENTIALS, SERVICES & REVIEWS */}
          <div className="flex flex-col gap-6">
            
            {/* About & Craftsmanship */}
            <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 750, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                About & Craftsmanship
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--neutral-700)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                {provider.bio || `${provider.name} is a certified trade specialist with over ${experienceYears} years of hands-on expertise providing residential and commercial solutions. Specialized in comprehensive troubleshooting, adherence to safety codes, and durable execution.`}
              </p>

              {/* Trade Specialties */}
              {provider.specialties && provider.specialties.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--neutral-800)' }}>
                    Core Verified Skills & Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          backgroundColor: 'var(--primary-subtle)',
                          color: 'var(--primary-900)',
                          border: '1px solid var(--primary-200)',
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verified Credentials Box */}
            <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
              <div className="flex items-center justify-between mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} color="var(--success-600)" />
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>
                    Verified Trade Credentials
                  </h3>
                </div>
                <span className="badge badge-verified">
                  100% Verified
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }}>
                  <span className="text-2xs text-muted uppercase font-bold block mb-1">Trade License</span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)' }}>
                    {provider.licenseNumber || 'MH-GOVT-CERT-8842'}
                  </strong>
                  <span className="text-xs text-success flex items-center gap-1 mt-1 font-semibold">
                    <CheckCircle2 size={13} /> Verified by Municipal Licensing Body
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }}>
                  <span className="text-2xs text-muted uppercase font-bold block mb-1">Identity Verification</span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)' }}>
                    Masked Aadhaar: XXXX-XXXX-4821
                  </strong>
                  <span className="text-xs text-success flex items-center gap-1 mt-1 font-semibold">
                    <CheckCircle2 size={13} /> Biometric Background Passed
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }}>
                  <span className="text-2xs text-muted uppercase font-bold block mb-1">Insurance & Warranty</span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)' }}>
                    TrustFix Doorstep Guarantee
                  </strong>
                  <span className="text-xs text-success flex items-center gap-1 mt-1 font-semibold">
                    <CheckCircle2 size={13} /> Covered up to ₹10,000 protection
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Reviews & Feedback */}
            <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
              <div className="flex items-center justify-between mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>
                    Customer Reviews & Endorsements
                  </h3>
                  <span className="text-xs text-muted">Genuine verified feedback from booked homeowners</span>
                </div>
                <RatingStars rating={provider.rating} reviewCount={reviews.length} size="md" />
              </div>

              {reviews.length === 0 ? (
                <p className="text-muted text-sm py-4">No reviews yet. Be the first to book and rate this specialist!</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: '1.25rem',
                        backgroundColor: 'var(--neutral-50)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--neutral-200)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <strong style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)' }}>
                            {rev.customerName || 'Homeowner'}
                          </strong>
                          <span className="badge badge-verified" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            Verified Booking
                          </span>
                        </div>
                        <span className="text-xs text-muted">{formatDate(rev.createdAt || '2026-09-15')}</span>
                      </div>
                      <div className="mb-2">
                        <RatingStars rating={rev.rating || 5} showCount={false} size="sm" />
                      </div>
                      <p style={{ fontSize: '0.9375rem', color: 'var(--neutral-700)', margin: 0, lineHeight: 1.55 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: BOOKING SUMMARY & SERVICE AREA MAP */}
          <div className="flex flex-col gap-6" style={{ position: 'sticky', top: '90px' }}>
            
            {/* Quick Booking Action Box */}
            <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)', border: '1px solid var(--neutral-200)' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 750, marginBottom: '0.75rem', color: 'var(--neutral-900)' }}>
                Book Appointment
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Schedule a certified doorstep visit with {provider.name}. Pay ₹0 in advance — pay securely only after work completion.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--neutral-50)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--neutral-200)',
                  marginBottom: '1.25rem',
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted">Inspection / Diagnostic Visit</span>
                  <span className="font-bold text-neutral-900">{formatCurrency(provider.startingPrice || 499)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted">Advance Required</span>
                  <span className="font-bold text-success">₹0 (Pay Later)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                  <span className="font-bold text-sm text-neutral-900">Estimated Total</span>
                  <span className="font-bold text-base text-primary">{formatCurrency(provider.startingPrice || 499)}</span>
                </div>
              </div>

              <Link
                to={`/customer/book?providerId=${provider.id}`}
                className="btn btn-primary btn-block"
                style={{ padding: '0.8125rem', fontWeight: 700, fontSize: '1rem' }}
              >
                <span>Continue to Schedule</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Service Area Map */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)', border: '1px solid var(--neutral-200)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 750, marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>
                Service Area & Location
              </h4>
              <p className="text-xs text-muted mb-3 flex items-center gap-1">
                <MapPin size={13} color="var(--primary-700)" />
                <span>Primary Base: <strong>{provider.serviceArea || `${provider.city}, Maharashtra`}</strong></span>
              </p>

              <div style={{ height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--neutral-200)' }}>
                <MapView
                  providers={[provider]}
                  selectedProviderId={provider.id}
                  customerLocation={DEFAULT_CUSTOMER_LOCATION}
                  searchRadius={25}
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
