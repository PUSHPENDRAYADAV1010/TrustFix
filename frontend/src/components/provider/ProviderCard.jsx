import React from 'react';
import { Link } from 'react-router-dom';
import { RatingStars } from '../common/RatingStars';
import { VerificationBadge } from '../common/VerificationBadge';
import { formatCurrency } from '../../utils/formatters';
import { resolveProviderAvatar } from '../../utils/imageResolver';
import { calculateDistance, formatDistance } from '../../utils/distance';
import { MapPin, Map, ArrowRight, CheckCircle2, Navigation, Award, Sparkles } from 'lucide-react';

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

  return (
    <div
      className="card card-hoverable"
      style={{
        position: 'relative',
        border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
        boxShadow: isSelected ? '0 8px 24px rgba(30, 58, 138, 0.15)' : 'var(--shadow-xs)',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
    >
      {/* Top Banner Tag if recommended within search radius */}
      {computedDistance !== null && isWithinRadius && maxRadius && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '4px 1rem',
            fontSize: '11px',
            color: 'var(--success-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 600,
          }}
        >
          <span className="flex items-center gap-1">
            <Sparkles size={12} color="var(--success-600)" />
            <span>Recommended in your {maxRadius} km area</span>
          </span>
          <span className="font-bold">{formatDistance(computedDistance)}</span>
        </div>
      )}

      <div className="card-body" style={{ padding: '1.25rem' }}>
        <div className="flex items-start gap-4">
          {/* Avatar with Status Dot */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarUrl}
              alt={provider.name}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                border: '2px solid var(--white)',
                boxShadow: 'var(--shadow-sm)',
                backgroundColor: 'var(--neutral-100)',
              }}
            />
            <span
              className={`status-dot ${provider.available ? 'online' : 'offline'}`}
              style={{ position: 'absolute', bottom: '-2px', right: '-2px' }}
              title={provider.available ? 'Available for bookings' : 'Currently busy'}
            />
          </div>

          {/* Core Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
              <Link
                to={`/providers/${provider.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                  {provider.name}
                </h4>
              </Link>
              <VerificationBadge status={provider.verificationStatus} size="sm" />
            </div>

            {provider.companyName && (
              <p className="text-xs font-semibold" style={{ color: 'var(--primary-700)', marginBottom: '4px' }}>
                {provider.companyName}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap text-xs text-muted mb-2">
              <span className="font-semibold" style={{ color: 'var(--neutral-800)' }}>
                {provider.service}
              </span>
              <span>•</span>
              <span>{provider.experience || provider.experienceYears || 5} yrs exp</span>
              <span>•</span>
              <span>{provider.completedJobs || 40}+ jobs</span>
            </div>

            {/* Ratings & Reviews */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} size="sm" />

              {/* Distance Tag */}
              {computedDistance !== null && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isWithinRadius ? 'var(--primary-800)' : 'var(--neutral-600)',
                    backgroundColor: isWithinRadius ? 'var(--primary-50)' : 'var(--neutral-100)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  <Navigation size={11} />
                  <span>{formatDistance(computedDistance)}</span>
                </span>
              )}
            </div>

            {/* Service Area */}
            <p className="text-xs text-muted mb-2 flex items-center gap-1">
              <MapPin size={12} color="var(--neutral-400)" />
              <span className="text-truncate">Area: <strong>{provider.serviceArea || `${provider.city}, Maharashtra`}</strong></span>
            </p>

            {/* Specialties Chips */}
            {provider.specialties && provider.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {provider.specialties.slice(0, 3).map((spec, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '10px',
                      backgroundColor: 'var(--neutral-100)',
                      color: 'var(--neutral-700)',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 500,
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Row: Starting Price & CTAs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--neutral-200)',
                paddingTop: '0.875rem',
                marginTop: '0.25rem',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <span className="text-2xs text-muted block uppercase font-bold" style={{ letterSpacing: '0.04em' }}>Starting Visit</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-800)' }}>
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
                  >
                    <Map size={13} />
                    <span>Map</span>
                  </button>
                )}

                <Link
                  to={provider?.serviceId ? `/customer/book?providerId=${provider.id}&serviceId=${provider.serviceId}` : `/customer/book?providerId=${provider.id}`}
                  className="btn btn-sm btn-primary"
                  style={{ padding: '0.45rem 0.9rem' }}
                >
                  <span>Select & Book</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
