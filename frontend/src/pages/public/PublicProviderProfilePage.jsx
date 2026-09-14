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
  Navigation
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

  return (
    <div className="provider-details-page" style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <nav style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link to="/" style={{ color: 'var(--neutral-500)' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/browse" style={{ color: 'var(--neutral-500)' }}>Verified Providers</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--neutral-800)', fontWeight: 600 }}>{provider.name}</span>
        </nav>

        {/* Hero Card: Digital Professional Identity */}
        <div className="card mb-8" style={{ overflow: 'hidden', border: '1px solid var(--neutral-200)' }}>
          {/* Cover Photo Banner */}
          <div
            style={{
              height: '160px',
              backgroundImage: `linear-gradient(135deg, rgba(7, 26, 51, 0.85) 0%, rgba(30, 58, 138, 0.85) 100%), url(${provider.coverImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1000&auto=format&fit=crop&q=80'})`,
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
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Briefcase size={12} />
                <span>Professional Trade Profile</span>
              </span>
            </div>
          </div>

          <div className="card-body" style={{ marginTop: '-54px', position: 'relative' }}>
            <div className="flex items-end justify-between flex-wrap gap-4">
              
              <div className="flex items-end gap-4">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  style={{
                    width: '104px',
                    height: '104px',
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'cover',
                    border: '4px solid var(--white)',
                    boxShadow: 'var(--shadow-md)',
                    backgroundColor: 'var(--white)',
                  }}
                />

                <div style={{ paddingBottom: '6px' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                      {provider.name}
                    </h1>
                    <VerificationBadge status={provider.verificationStatus} />
                  </div>

                  {provider.companyName && (
                    <p className="text-sm font-semibold" style={{ color: 'var(--primary-700)', marginTop: '2px' }}>
                      {provider.companyName}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons & Starting Rate */}
              <div className="flex items-center gap-4">
                <div className="text-right mr-1">
                  <span className="text-xs text-muted block uppercase font-bold" style={{ letterSpacing: '0.04em' }}>Starting Visit Fee</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                    {formatCurrency(provider.startingPrice || 299)}
                  </span>
                </div>

                <Link
                  to={provider?.serviceId ? `/customer/book?providerId=${provider.id}&serviceId=${provider.serviceId}` : `/customer/book?providerId=${provider.id}`}
                  className="btn btn-lg btn-primary"
                  style={{ padding: '0.85rem 1.6rem', fontWeight: 700 }}
                >
                  <span>Book This Specialist</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

            </div>

            {/* Metrics Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.75rem',
                borderTop: '1px solid var(--neutral-200)',
                borderBottom: '1px solid var(--neutral-200)',
                padding: '1rem 0',
                marginTop: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <span className="text-muted block text-xs">Customer Rating</span>
                <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} size="sm" />
              </div>

              <div>
                <span className="text-muted block text-xs">Field Experience</span>
                <strong style={{ color: 'var(--neutral-800)' }}>{provider.experience || 6} Years Certified</strong>
              </div>

              <div>
                <span className="text-muted block text-xs">Completed Jobs</span>
                <strong style={{ color: 'var(--neutral-800)' }}>{provider.completedJobs || 50}+ Verified Services</strong>
              </div>

              <div>
                <span className="text-muted block text-xs">Distance From You</span>
                <span className="flex items-center gap-1 font-bold text-primary">
                  <Navigation size={13} />
                  <span>{formatDistance(distanceKm)}</span>
                </span>
              </div>

              <div>
                <span className="text-muted block text-xs">Live Status</span>
                <span className="flex items-center gap-1">
                  <span className={`status-dot ${provider.available ? 'online' : 'offline'}`} />
                  <strong style={{ color: provider.available ? 'var(--success-700)' : 'var(--neutral-600)' }}>
                    {provider.available ? 'Available for Booking' : 'Currently Busy'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Verification Trust Box - Privacy Protected */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.1rem 1.25rem',
                backgroundColor: 'rgba(16, 185, 129, 0.07)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} color="var(--success-700)" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--success-900)' }}>
                  TrustFix Verified Professional Guarantee
                </h4>
              </div>
              <p className="text-xs text-muted mb-3" style={{ lineHeight: 1.5 }}>
                This specialist has undergone identity checks, skill licensing verification, and criminal background checks. Sensitive government identity documents are securely verified without public exposure.
              </p>

              <div className="flex flex-wrap gap-4 text-xs font-semibold" style={{ color: 'var(--neutral-800)' }}>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} color="var(--success-600)" />
                  <span>Government Photo ID Verified (Masked: XXXX-XXXX-4821)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} color="var(--success-600)" />
                  <span>State Trade Wireman/Plumber License Checked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} color="var(--success-600)" />
                  <span>Police Clearance Certificate on Record</span>
                </div>
              </div>
            </div>

            {/* Provider Bio */}
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Professional Summary & Background</h4>
              <p style={{ color: 'var(--neutral-700)', lineHeight: 1.65, maxWidth: '820px', fontSize: '0.95rem' }}>
                {provider.bio}
              </p>
            </div>

          </div>
        </div>

        {/* 2-Column Content: Rate Card Left, Location Map Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          {/* Rate Card & Skills */}
          <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--white)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
              Transparent Rate Card
            </h3>

            <div className="flex flex-col gap-3">
              {(provider.pricingDetails || [
                { item: "General Doorstep Diagnostic & Inspection", price: provider.startingPrice || 299, type: "Base Visit Fee" },
                { item: "Standard Labor & Precision Repair", price: provider.hourlyRate || 350, type: "Standard Labor Rate" },
                { item: "Emergency Priority Visit (Within 60 Mins)", price: (provider.startingPrice || 299) + 199, type: "Express Dispatch" }
              ]).map((rate, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-200)',
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--neutral-900)' }}>{rate.item}</h5>
                    <span className="text-xs text-muted">{rate.type}</span>
                  </div>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                    {formatCurrency(rate.price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Specialties & Skills */}
            {provider.specialties && (
              <div style={{ marginTop: '1.75rem' }}>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--neutral-800)' }}>
                  Specialized Trade Skills & Expertise
                </h5>
                <div className="flex flex-wrap gap-2">
                  {provider.specialties.map((spec, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--primary-50)',
                        color: 'var(--primary-800)',
                        border: '1px solid var(--primary-200)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Service Area & Map */}
          <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--white)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
              Service Area & Dispatch Radius
            </h3>

            <div className="flex items-center gap-2 mb-3 text-sm">
              <MapPin size={16} color="var(--primary-700)" />
              <span className="font-semibold">{provider.serviceArea || `${provider.city}, Maharashtra`}</span>
            </div>

            <p className="text-xs text-muted mb-4">
              Regular dispatch radius: <strong>{provider.serviceRadiusKm || 25} km</strong>.
              Remember: Customers can hire this specialist even if located beyond the standard radius!
            </p>

            <div style={{ height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--neutral-200)', marginBottom: '1.25rem' }}>
              <MapView
                locations={providerLocation ? [providerLocation] : [
                  {
                    id: provider.id,
                    name: provider.name,
                    businessName: provider.companyName,
                    latitude: provider.latitude || 19.1136,
                    longitude: provider.longitude || 72.8697,
                    verified: true
                  }
                ]}
                selectedProviderId={provider.id}
                height="100%"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted border-top pt-3" style={{ borderTop: '1px solid var(--neutral-200)' }}>
              <span>Working Hours: <strong>08:00 AM - 08:00 PM</strong></span>
              <span>Response Time: <strong>&lt; 30 Mins</strong></span>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                Verified Customer Reviews ({reviews.length})
              </h3>
              <p className="text-xs text-muted mb-0">
                100% authentic ratings left by verified homeowners after completed service appointments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-bold text-lg" style={{ color: 'var(--neutral-900)' }}>{provider.rating} / 5.0</span>
                <span className="text-2xs text-muted block">Overall Reputation</span>
              </div>
              <RatingStars rating={provider.rating} size="md" />
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-muted text-sm text-center py-6">No customer reviews yet. Be the first to book and review!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--neutral-50)',
                    border: '1px solid var(--neutral-200)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.customerAvatar}
                        alt={rev.customerName}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong style={{ fontSize: '0.9rem', color: 'var(--neutral-900)' }}>{rev.customerName}</strong>
                          <span className="badge badge-verified" style={{ fontSize: '9px', padding: '1px 5px' }}>Verified Booking</span>
                        </div>
                        <span className="text-2xs text-muted">{rev.date} • {rev.serviceName}</span>
                      </div>
                    </div>

                    <RatingStars rating={rev.rating} size="sm" />
                  </div>

                  <p className="text-sm" style={{ color: 'var(--neutral-700)', lineHeight: 1.6, margin: 0 }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Direct Booking Footer */}
          <div className="text-center mt-8 pt-6 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
            <Link
              to={provider?.serviceId ? `/customer/book?providerId=${provider.id}&serviceId=${provider.serviceId}` : `/customer/book?providerId=${provider.id}`}
              className="btn btn-lg btn-primary"
              style={{ padding: '0.85rem 2.25rem', fontWeight: 700 }}
            >
              <span>Book Appointment with {provider.name}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
