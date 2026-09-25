import React from 'react';
import { Link } from 'react-router-dom';
import { RatingStars } from '../common/RatingStars';
import { VerificationBadge } from '../common/VerificationBadge';
import { formatCurrency } from '../../utils/formatters';
import { resolveProviderAvatar } from '../../utils/imageResolver';
import { calculateDistance, formatDistance } from '../../utils/distance';
import { MapPin, Map, ArrowRight, Navigation, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ProviderCard = ({
  provider,
  onSelectOnMap,
  isSelected = false,
  customerLocation = null,
  maxRadius = null
}) => {
  const avatarUrl = provider.avatar || resolveProviderAvatar(provider);

  // Compute real-time distance if customer location coordinates are available
  const computedDistance = (customerLocation?.latitude && provider?.latitude)
    ? calculateDistance(
        customerLocation.latitude,
        customerLocation.longitude,
        provider.latitude,
        provider.longitude
      )
    : (provider.distanceKm !== undefined ? provider.distanceKm : null);

  const isWithinRadius = maxRadius && computedDistance !== null ? computedDistance <= Number(maxRadius) : true;
  const experienceYears = provider.experience || provider.experienceYears || 5;
  const completedJobs = provider.completedJobs || 40;

  return (
    <div
      className={`card card-hoverable ${isSelected ? 'selected-pro-card' : ''}`}
      style={{
        border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
        boxShadow: isSelected ? '0 8px 24px rgba(11, 30, 59, 0.12)' : 'var(--shadow-xs)',
        transition: 'all var(--transition-normal)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top recommendation highlight banner if within search radius preference */}
      {computedDistance !== null && isWithinRadius && maxRadius && (
        <div
          style={{
            backgroundColor: 'var(--success-50)',
            borderBottom: '1px solid rgba(5, 150, 105, 0.2)',
            padding: '6px 1.25rem',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--success-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 600,
          }}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} color="var(--success-600)" />
            <span>Recommended in your {maxRadius} km area</span>
          </span>
          <span className="font-bold text-success">{formatDistance(computedDistance)}</span>
        </div>
      )}

      {/* Main Professional Identity Header */}
      <div className="card-body" style={{ padding: '1.375rem 1.375rem 1rem 1.375rem' }}>
        <div className="flex items-start gap-3.5 mb-3.5">
          {/* Avatar with Status indicator */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarUrl}
              alt={provider.name}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                border: '2px solid var(--neutral-200)',
                boxShadow: 'var(--shadow-xs)',
                backgroundColor: 'var(--neutral-100)',
              }}
            />
            <span
              className={`status-dot ${provider.available ? 'online' : 'offline'}`}
              style={{ position: 'absolute', bottom: '-2px', right: '-2px' }}
              title={provider.available ? 'Available for booking' : 'Currently busy'}
            />
          </div>

          {/* Name & Trade Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 flex-wrap mb-1">
              <Link
                to={`/providers/${provider.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h4
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 750,
                    margin: 0,
                    color: 'var(--neutral-900)',
                    lineHeight: 1.25,
                  }}
                  className="text-truncate"
                >
                  {provider.name}
                </h4>
              </Link>
              <VerificationBadge status={provider.verificationStatus} size="sm" />
            </div>

            {/* Trade Specialty */}
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--primary-800)',
                fontWeight: 600,
                margin: '0 0 4px 0',
                lineHeight: 1.3
              }}
              className="text-truncate"
            >
              {provider.companyName || provider.service || 'Certified Specialist'}
            </p>

            {/* Experience & Completed Jobs */}
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{experienceYears} yrs experience</span>
              <span>•</span>
              <span className="font-medium text-neutral-800">{completedJobs}+ verified jobs</span>
            </div>
          </div>
        </div>

        {/* Rating and Distance strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: 'var(--neutral-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--neutral-200)',
            marginBottom: '1rem',
          }}
        >
          <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} size="sm" />

          {computedDistance !== null ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 650,
                color: isWithinRadius ? 'var(--primary-800)' : 'var(--neutral-600)',
              }}
            >
              <Navigation size={12} color="var(--primary-700)" />
              <span>{formatDistance(computedDistance)}</span>
            </span>
          ) : (
            <span className="text-xs text-muted flex items-center gap-1">
              <MapPin size={12} />
              <span>{provider.city || 'Mumbai'}</span>
            </span>
          )}
        </div>

        {/* Location / Coverage area */}
        <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
          <MapPin size={13} color="var(--neutral-400)" style={{ flexShrink: 0 }} />
          <span className="text-truncate">
            Service area: <strong style={{ color: 'var(--neutral-700)' }}>{provider.serviceArea || `${provider.city || 'Mumbai'}, Metro`}</strong>
          </span>
        </div>

        {/* Key Trade Skills / Specialties */}
        {provider.specialties && provider.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {provider.specialties.slice(0, 3).map((spec, i) => (
              <span
                key={i}
                style={{
                  fontSize: 'var(--font-size-xs)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary-800)',
                  border: '1px solid var(--primary-200)',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500,
                  lineHeight: 1.25,
                }}
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Starting Price & CTAs */}
      <div
        style={{
          borderTop: '1px solid var(--neutral-200)',
          padding: '0.875rem 1.375rem',
          backgroundColor: 'var(--white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              color: 'var(--neutral-500)',
              display: 'block',
              lineHeight: 1.2
            }}
          >
            Starting Rate
          </span>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--primary-900)',
              lineHeight: 1.2
            }}
          >
            {formatCurrency(provider.startingPrice || 499)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSelectOnMap && (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => onSelectOnMap(provider.id)}
              title="Locate on map"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              <Map size={14} />
              <span>Map</span>
            </button>
          )}

          <Link
            to={provider?.serviceId ? `/customer/book?providerId=${provider.id}&serviceId=${provider.serviceId}` : `/customer/book?providerId=${provider.id}`}
            className="btn btn-sm btn-primary"
            style={{ padding: '0.5rem 1rem', fontWeight: 650 }}
          >
            <span>Select & Book</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
